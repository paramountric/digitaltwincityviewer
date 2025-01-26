import { BaseLayout } from './BaseLayout.js';
import { LayoutNode } from './LayoutNode.js';
import { Graph } from '../Graph.js';
import { Node } from '../Node.js';
import { Edge } from '../Edge.js';

const defaultOptions = {
  nodePositionAccessor: node => [
    node.getPropertyValue('x'),
    node.getPropertyValue('y'),
  ],
};

class SimpleLayout extends BaseLayout {
  graph: Graph;
  nodeMap: {
    [nodeId: string]: LayoutNode;
  };
  // ? why needed
  nodePositionMap: {
    [nodeId: string]: number[];
  };
  constructor(options) {
    super();
    this.name = 'SimpleLayout';
    this.options = {
      ...defaultOptions,
      ...options,
    };
    this.graph = null;
    // ? why needed
    this.nodePositionMap = {};
  }

  initializeGraph(graph) {
    this.updateGraph(graph);
  }

  notifyLayoutComplete() {
    this.callbacks.onLayoutChange();
    this.callbacks.onLayoutDone();
  }

  start() {
    this.notifyLayoutComplete();
  }

  resume() {
    this.notifyLayoutComplete();
  }

  updateGraph(graph) {
    this.graph = graph;
    this.nodeMap = graph.getNodes().reduce((res, node) => {
      res[node.getId()] = node;
      return res;
    }, {});
    this.nodePositionMap = graph.getNodes().reduce((res, node) => {
      res[node.getId()] = this.options.nodePositionAccessor(node);
      return res;
    }, {});
  }

  setNodePositionAccessor = accessor => {
    this.options.nodePositionAccessor = accessor;
  };

  getNodePosition = (node: Node): number[] =>
    this.nodePositionMap[node.getId()];

  getEdgePosition = (edge: Edge) => {
    const sourcePos = this.nodePositionMap[edge.getSourceNodeId()];
    const targetPos = this.nodePositionMap[edge.getTargetNodeId()];
    return {
      type: 'LINE',
      sourcePosition: sourcePos,
      targetPosition: targetPos,
      sourceDirection: [1, 0],
      targetDirection: [1, 0],
      controlPoints: [],
    };
  };

  lockNodePosition = (node, x, y) => {
    this.nodePositionMap[node.getId()] = [x, y];
    this.callbacks.onLayoutChange();
    this.callbacks.onLayoutDone();
  };
}

export { SimpleLayout };
