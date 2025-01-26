import {
  forceSimulation as ForceSimulation,
  forceManyBody,
  forceLink,
  forceCenter,
  forceCollide,
} from 'd3-force';
import { Graph } from '../Graph.js';
import { BaseLayout } from './BaseLayout.js';
import { LayoutNode } from './LayoutNode.js';
import { LayoutEdge } from './LayoutEdge.js';
import { Node } from '../Node.js';

type ForceLayoutOptions = {
  center?: number[];
};

const defaultOptions = {
  // alpha: 0.3,
  // resumeAlpha: 0.1,
  // nBodyStrength: -1,
  // nBodyDistanceMin: 10,
  // nBodyDistanceMax: 40,
  alpha: 0.3,
  resumeAlpha: 0.1,
  nBodyStrength: -900,
  nBodyDistanceMin: 100,
  nBodyDistanceMax: 400,
  getCollisionRadius: d => d.collisionRadius,
};

class ForceLayout extends BaseLayout {
  graph: Graph; // original ref
  simulator: ForceSimulation;
  //clusterRadius = 25;
  layoutGraph: {
    nodes: LayoutNode[];
    edges: LayoutEdge[];
  };
  nodeMap: {
    [nodeId: string]: LayoutNode;
  };
  edgeMap: {
    [edgeId: string]: LayoutEdge;
  };
  constructor(options: ForceLayoutOptions = {}) {
    super();
    this.name = 'ForceLayout';
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
    console.log('INIT GRAPH Layoyt');
    this.graph = graph;
    this.nodeMap = {};
    this.edgeMap = {};
    // nodes
    const layoutNodes = graph.getNodes().map(node => {
      const id = node.id;
      const locked = node.getPropertyValue('locked') || false;
      const x = node.getPropertyValue('x') || 0;
      const y = node.getPropertyValue('y') || 0;
      const collisionRadius = node.getPropertyValue('collisionRadius') || 0;
      const layoutNode: LayoutNode = {
        id,
        x,
        y,
        fx: locked ? x : null,
        fy: locked ? y : null,
        collisionRadius,
      };
      this.nodeMap[node.id] = layoutNode;
      return layoutNode;
    });
    // edges
    const layoutEdges = graph.getEdges().map(edge => {
      const layoutEdge = {
        id: edge.id,
        source: this.nodeMap[edge.getSourceNodeId()],
        target: this.nodeMap[edge.getTargetNodeId()],
      };
      this.edgeMap[edge.id] = layoutEdge;
      return layoutEdge;
    });
    this.layoutGraph = {
      nodes: layoutNodes,
      edges: layoutEdges,
    };
  }

  _generateSimulator() {
    if (this.simulator) {
      this.simulator.on('tick', null).on('end', null);
      this.simulator = null;
    }
    const {
      alpha,
      nBodyStrength,
      nBodyDistanceMin,
      nBodyDistanceMax,
      getCollisionRadius,
      center,
    } = this.options;

    console.log('center', center);

    const g = this.layoutGraph;
    this.simulator = ForceSimulation(g.nodes)
      .force(
        'edge',
        forceLink(g.edges)
          .id(n => n.id)
          .strength(this._strength)
      )
      .force(
        'charge',
        forceManyBody()
          .strength(nBodyStrength)
          .distanceMin(nBodyDistanceMin)
          .distanceMax(nBodyDistanceMax)
      )
      //.force('center', forceCenter(center || [0, 0]))
      .force('collision', forceCollide().radius(getCollisionRadius))
      .alpha(alpha);
    // register event callbacks
    this.simulator
      .on('tick', this.callbacks.onLayoutChange)
      .on('end', this.callbacks.onLayoutDone);
  }

  _strength = layoutEdge => {
    const sourceDegree = this.graph.getDegree(layoutEdge.source.id);
    const targetDegree = this.graph.getDegree(layoutEdge.target.id);
    return 1 / Math.min(sourceDegree, targetDegree, 1);
  };

  start() {
    this._generateSimulator();
    this.simulator.restart();
  }

  resume() {
    const { resumeAlpha } = this.options;
    this.simulator.alpha(resumeAlpha).restart();
  }

  stop() {
    this.simulator.stop();
  }

  // for steaming new data on the same graph
  updateGraph(graph) {
    console.log('UPDATE GRAPH IS UPDATED <- is this ever used');
    if (this.graph.getGraphName() !== graph.getGraphName()) {
      // reset the maps
      this.nodeMap = {};
      this.edgeMap = {};
    }
    this.graph = graph;
    // update internal layout data
    // nodes
    const newNodeMap = {};
    const newD3Nodes = graph.getNodes().map(node => {
      const id = node.id;
      const locked = node.getPropertyValue('locked') || false;
      const x = node.getPropertyValue('x') || 0;
      const y = node.getPropertyValue('y') || 0;
      const fx = locked ? x : null;
      const fy = locked ? y : null;
      const collisionRadius = node.getPropertyValue('collisionRadius') || 0;

      const oldD3Node = this.nodeMap[node.id];
      const newD3Node = oldD3Node
        ? oldD3Node
        : { id, x, y, fx, fy, collisionRadius };
      newNodeMap[node.id] = newD3Node;
      return newD3Node;
    });
    this.nodeMap = newNodeMap;
    this.layoutGraph.nodes = newD3Nodes;
    // edges
    const newEdgeMap = {};
    const newlayoutEdges = graph.getEdges().map(edge => {
      const oldlayoutEdge = this.edgeMap[edge.id];
      const newlayoutEdge = oldlayoutEdge
        ? oldlayoutEdge
        : {
            id: edge.id,
            source: newNodeMap[edge.getSourceNodeId()],
            target: newNodeMap[edge.getTargetNodeId()],
          };
      newEdgeMap[edge.id] = newlayoutEdge;
      return newlayoutEdge;
    });
    this.edgeMap = newEdgeMap;
    this.layoutGraph.edges = newlayoutEdges;
  }

  getLayoutNodes = (): LayoutNode[] => {
    return this.layoutGraph.nodes;
  };

  getNodePosition = (node: Node): number[] => {
    if (node.isCluster) {
      super.getNodePosition(node);
    }
    const layoutNode = this.nodeMap[node.id];
    if (layoutNode) {
      return [layoutNode.x, layoutNode.y];
    }
    return [0, 0];
  };

  getEdgePosition = edge => {
    const layoutEdge = this.edgeMap[edge.id];
    const sourcePosition = layoutEdge && layoutEdge.source;
    const targetPosition = layoutEdge && layoutEdge.target;
    if (layoutEdge && sourcePosition && targetPosition) {
      return {
        type: edge.type || 'LINE',
        sourcePosition: [sourcePosition.x, sourcePosition.y],
        targetPosition: [targetPosition.x, targetPosition.y],
        sourceDirection: [1, 0],
        targetDirection: [1, 0],
        controlPoints: [],
      };
    }
    return {
      type: edge.type || 'LINE',
      sourcePosition: [0, 0],
      targetPosition: [0, 0],
      sourceDirection: [1, 0],
      targetDirection: [1, 0],
      controlPoints: [],
    };
  };

  lockNodePosition = (node, x, y) => {
    const layoutNode = this.nodeMap[node.id];
    layoutNode.x = x;
    layoutNode.y = y;
    layoutNode.fx = x;
    layoutNode.fy = y;
    this.callbacks.onLayoutChange();
    this.callbacks.onLayoutDone();
  };

  unlockNodePosition = node => {
    const layoutNode = this.nodeMap[node.id];
    layoutNode.fx = null;
    layoutNode.fy = null;
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

export { ForceLayout };
