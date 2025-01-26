import { stratify, tree } from 'd3-hierarchy';
import { Graph, Node, Edge } from '../index.js';
import { BaseLayout } from './BaseLayout.js';
import { LayoutNode } from './LayoutNode.js';
import { LayoutEdge } from './LayoutEdge.js';

const defaultOptions = {};

class TreeLayout extends BaseLayout {
  graph: Graph; // this should not be manipulated in other than manual layout
  layoutGraph: {
    nodes: LayoutNode[];
    edges: LayoutEdge[];
  }; // the x and y should not mess with user x and y used in manual layout
  nodeMap: {
    [nodeId: string]: LayoutNode;
  };
  edgeMap: {
    [edgeId: string]: LayoutEdge;
  };
  constructor(options) {
    super();
    this.name = 'TreeLayout';
    this.options = {
      ...defaultOptions,
      ...options,
    };
    // store graph and prepare internal data
    this.layoutGraph = { nodes: [], edges: [] };
    this.nodeMap = {};
    this.edgeMap = {};
  }

  initializeGraph(graph: Graph) {
    this.graph = graph;
    this.layoutGraph = { nodes: [], edges: [] };
    // nodes
    const nodes = graph.getNodes().map(node => {
      const id = node.id;
      const locked = node.getPropertyValue('locked') || false;
      const x = node.getPropertyValue('x') || 0;
      const y = node.getPropertyValue('y') || 0;
      const newNode: LayoutNode = {
        x,
        y,
        fx: locked ? x : null,
        fy: locked ? y : null,
        id,
      };
      this.nodeMap[node.id] = newNode;
      return newNode;
    });
    // edges
    const edges = graph.getEdges().map(edge => {
      const source = this.nodeMap[edge.getSourceNodeId()];
      const target = this.nodeMap[edge.getTargetNodeId()];
      const newEdge: LayoutEdge = {
        id: edge.id,
        source,
        target,
      };
      this.edgeMap[edge.id] = newEdge;
      return newEdge;
    });
    this.layoutGraph = {
      nodes,
      edges,
    };
  }

  notifyLayoutComplete() {
    console.log(this);
    this.callbacks.onLayoutChange();
    this.callbacks.onLayoutDone();
  }

  // todo: figure out if strength can be used for tree layout
  getStrength = (edge: Edge) => {
    const sourceDegree = this.graph.getDegree(edge.source.id);
    const targetDegree = this.graph.getDegree(edge.target.id);
    return 1 / Math.min(sourceDegree, targetDegree, 1);
  };

  start() {
    this.generateTreeLayout();
    this.notifyLayoutComplete();
  }

  resume() {
    this.notifyLayoutComplete();
  }

  generateTreeLayout() {
    const nodes = Object.values(this.nodeMap);
    const rootId = this.graph.getNodes().find(n => n.isRoot)?.id || nodes[0].id;
    const rootNode = this.nodeMap[rootId];
    const edges = Object.values(this.edgeMap);
    const connectedNodes = [rootNode];
    for (const edge of edges) {
      const source = this.nodeMap[edge.source.id];
      const target = this.nodeMap[edge.target.id];
      // the selected root is already added and should not have parentId
      if (target.id === rootId) {
        continue;
      }
      target.parentId = source.id;
      connectedNodes.push(target);
    }

    const root = stratify()(connectedNodes);
    const dx = 500 / (root.height + 1);
    const dy = -500 / (root.height + 1);
    tree().nodeSize([dx, dy])(root);

    const links = root.links();
    const descendants = root.descendants();

    for (const descendant of descendants) {
      const node = this.nodeMap[descendant.id];
      node.x = descendant.x;
      node.y = descendant.y;
    }

    console.log(this.edgeMap);
  }

  // for steaming new data on the same graph
  updateGraph(graph) {
    if (this.graph.getGraphName() !== graph.getGraphName()) {
      this.graph.reset();
    }
    this.graph = graph;
    // nodes
    const newNodeMap = {};
    for (const node of graph.getNodes()) {
      const id = node.id;
      const locked = node.getPropertyValue('locked') || false;
      const x = node.getPropertyValue('x') || 0;
      const y = node.getPropertyValue('y') || 0;
      const fx = locked ? x : null;
      const fy = locked ? y : null;

      const oldD3Node = this.nodeMap[node.id];
      const newD3Node = oldD3Node ? oldD3Node : { id, x, y, fx, fy };
      newNodeMap[node.id] = newD3Node;
    }
    this.nodeMap = newNodeMap;

    // edges
    const newEdgeMap = {};
    for (const edge of graph.getEdges()) {
      const oldD3Edge = this.edgeMap[edge.id];
      const newD3Edge = oldD3Edge
        ? oldD3Edge
        : {
            id: edge.id,
            source: newNodeMap[edge.getSourceNodeId()],
            target: newNodeMap[edge.getTargetNodeId()],
          };
      newEdgeMap[edge.id] = newD3Edge;
    }
    this.edgeMap = newEdgeMap;
  }

  getLayoutNodes = (): LayoutNode[] => {
    return this.layoutGraph.nodes;
  };

  getNodePosition = node => {
    const d3Node = this.nodeMap[node.id];
    if (d3Node) {
      return [-d3Node.y, d3Node.x];
    }
    return [0, 0];
  };

  getEdgePosition = edge => {
    const d3Edge = this.edgeMap[edge.id];
    const sourcePosition = d3Edge && d3Edge.source;
    const targetPosition = d3Edge && d3Edge.target;
    if (d3Edge && sourcePosition && targetPosition) {
      return {
        type: 'CURVE',
        sourcePosition: [-sourcePosition.y, sourcePosition.x],
        targetPosition: [-targetPosition.y, targetPosition.x],
        sourceDirection: [1, 0],
        targetDirection: [1, 0],
        controlPoints: [],
      };
    }
    return {
      type: 'CURVE',
      sourcePosition: [0, 0],
      targetPosition: [0, 0],
      sourceDirection: [1, 0],
      targetDirection: [1, 0],
      controlPoints: [],
    };
  };

  lockNodePosition = (node, x, y) => {
    const localNode = this.nodeMap[node.id];
    localNode.x = x;
    localNode.y = y;
    localNode.fx = x;
    localNode.fy = y;
    this.callbacks.onLayoutChange();
    this.callbacks.onLayoutDone();
  };

  unlockNodePosition = node => {
    const localNode = this.nodeMap[node.id];
    localNode.fx = null;
    localNode.fy = null;
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

export { TreeLayout };
