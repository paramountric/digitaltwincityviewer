import { tickFormat, scaleTime, scaleThreshold } from 'd3-scale';
import { stratify, tree } from 'd3-hierarchy';
import { BaseLayout } from './BaseLayout.js';
import { LayoutNode } from './LayoutNode.js';
import { LayoutEdge } from './LayoutEdge.js';
import { Graph } from '../Graph.js';
import { Node } from '../Node.js';
import { Edge } from '../Edge.js';
import { TimeManager } from './TimeManager.js';

const defaultOptions = {
  useTimelineX: false,
  nodePositionAccessor: node => [
    node.getPropertyValue('x'),
    node.getPropertyValue('y'),
  ],
};

type TimeProcessLayoutOptions = {
  useTimelineX?: boolean;
};

class TimeProcessLayout extends BaseLayout {
  graph: Graph;
  nodeMap: {
    [nodeId: string]: LayoutNode;
  };
  edgeMap: {
    [edgeId: string]: LayoutEdge;
  };
  intervalScale: scaleThreshold;
  timeManager: TimeManager;
  constructor(options: TimeProcessLayoutOptions) {
    super();
    this.name = 'TimeProcessLayout';
    this.options = {
      ...defaultOptions,
      ...options,
    };
    this.graph = null;
    // ? why needed
    this.nodeMap = {};
    this.edgeMap = {};

    this.timeManager = new TimeManager();
  }

  initializeGraph(graph: Graph) {
    this.updateGraph(graph);
  }

  // set layout nodes/edges (nodeMap, edgeMap)
  // todo: updateGraph should also only update changed nodes if graph has been manipulated instead of run through everything
  // ? how to call this, since updateGraph changes the edgeMap/nodeMap and start function must be executed again (should be done from layout engine?)
  updateGraph(graph: Graph) {
    this.graph = graph;
    this.nodeMap = graph.getNodes().reduce((res, node) => {
      res[node.getId()] = node;
      return res;
    }, {});
    const newEdgeMap = {};
    for (const edge of graph.getEdges()) {
      const oldEdge = this.edgeMap[edge.id];
      const newEdge = oldEdge
        ? oldEdge
        : {
            id: edge.id,
            source: this.nodeMap[edge.getSourceNodeId()],
            target: this.nodeMap[edge.getTargetNodeId()],
          };
      newEdgeMap[edge.id] = newEdge;
    }
    this.edgeMap = newEdgeMap;
  }

  notifyLayoutComplete() {
    this.callbacks.onLayoutChange();
    this.callbacks.onLayoutDone();
  }

  start() {
    // structure on a horizontal tree
    this.generateTreeLayout();
    if (this.options.useTimelineX) {
      // adjust x values to time
      this.generateTimeProcessLayout();
    }
    this.notifyLayoutComplete();
  }

  resume() {
    this.notifyLayoutComplete();
  }

  generateTimeProcessLayout() {
    const xScale = this.timeManager.getTimescale(
      this.graph.initAt,
      this.minX,
      this.maxX,
      0
    );
    for (const node of this.graph.getNodes()) {
      const x = xScale(new Date(node.createdAt));
      this.nodeMap[node.id].x = x;
      //this.nodeMap[node.id].y = node.y || 0;
    }
  }

  // add connected nodes to tree layout and transfer the x and y to layoutnodes
  generateTreeLayout() {
    // use edges to find the tree layout
    const edges = Object.values(this.edgeMap);
    const nodes = Object.values(this.nodeMap);
    // add a root of all nodes that will not be shown
    const rootNode: LayoutNode = {
      id: '__root',
      x: 0,
      y: 0,
      fx: null,
      fy: null,
    };
    const connectedNodes = {
      [rootNode.id]: rootNode,
    };
    for (const edge of edges) {
      const source = this.nodeMap[edge.source.id];
      const target = this.nodeMap[edge.target.id];
      target.parentId = source.id;
      connectedNodes[source.id] = source;
      connectedNodes[target.id] = target;
    }
    // if node not part of edge, add node to invisible root
    for (const node of nodes) {
      if (!connectedNodes[node.id]) {
        node.parentId = '__root';
        connectedNodes[node.id] = node;
      }
    }
    const connectedNodesArr = Object.values(connectedNodes);
    // for all connected nodes without parent, add the root node
    for (const node of connectedNodesArr) {
      if (node.id !== '__root' && !node.parentId) {
        node.parentId = '__root';
      }
    }
    // ! note that the tree is drawn top down - so x is y
    const root = stratify()(connectedNodesArr);
    // ! problem with below is that zoom is not zooming in to mouse position
    // const dx = (16 * (root.height + 1)) / 2 ** this.zoom;
    // const dy = (16 * (root.height + 1)) / 2 ** this.zoom;

    // old values for extreme zoom
    // const dx = 0.02 * (root.height + 1);
    // the negative value will reverse the three on x axis
    // const dy = -0.06 * (root.height + 1);

    // old values where multiplied by 1000
    const dx = 20 * (root.height + 1);
    const dy = -40 * (root.height + 1);

    tree().nodeSize([dx, dy])(root);

    const descendants = root.descendants();

    // apply the position on layout nodes
    for (const descendant of descendants) {
      const node = this.nodeMap[descendant.id];
      if (node) {
        node.x = -1 * descendant.y + dy;
        node.y = descendant.x;
      }
    }
  }

  setNodePositionAccessor = accessor => {
    this.options.nodePositionAccessor = accessor;
  };

  getLayoutNodes = (): LayoutNode[] => {
    return Object.values(this.nodeMap);
  };

  getNodePosition = (node: Node): number[] => {
    // if the layout has not completed, the graph can contain nodes without position
    // so 0, 0 will be used
    const { x, y } = this.nodeMap[node.id] || {};
    return [x || 0, y || 0];
  };

  getEdgePosition = (edge: Edge) => {
    // if layout nodes has not beed added yet, return 0, 0
    const sourceNode = this.nodeMap[edge.getSourceNodeId()] || { x: 0, y: 0 };
    const targetNode = this.nodeMap[edge.getTargetNodeId()] || { x: 0, y: 0 };
    return {
      type: 'CURVE', // todo: change to CURVE and fix width
      sourcePosition: [sourceNode.x || 0, sourceNode.y || 0] || [0, 0],
      targetPosition: [targetNode.x || 0, targetNode.y || 0] || [0, 0],
      sourceDirection: [1, 0],
      targetDirection: [1, 0],
      controlPoints: [],
    };
  };

  lockNodePosition = (node, x, y) => {
    const lockNode = this.nodeMap[node.getId()];
    lockNode.x = x;
    lockNode.y = y;
    this.callbacks.onLayoutChange();
    this.callbacks.onLayoutDone();
  };

  // get current layout to use on new graph
  getLayoutPositions = (): {
    [nodeId: string]: number[];
  } => {
    const nodes = Object.values(this.graph.nodeMap);
    const nodePositionMap = {};
    for (const node of nodes) {
      const { x, y } = this.nodeMap[node.id] || {};
      if (x || x === 0 || y || y === 0) {
        nodePositionMap[node.id] = [x || 0, y || 0];
      }
    }
    return nodePositionMap;
  };
}

export { TimeProcessLayout };
