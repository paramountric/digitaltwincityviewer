import { tickFormat, scaleTime, scaleThreshold } from 'd3-scale';
import { BaseLayout } from './BaseLayout.js';
import { LayoutNode } from './LayoutNode.js';
import { LayoutEdge } from './LayoutEdge.js';
import { Graph } from '../Graph.js';
import { Node } from '../Node.js';
import { Edge } from '../Edge.js';
import { TimeManager } from './TimeManager.js';

const defaultOptions = {
  nodePositionAccessor: node => [
    node.getPropertyValue('x'),
    node.getPropertyValue('y'),
  ],
};

class TimelineLayout extends BaseLayout {
  graph: Graph;
  layoutGraph: {
    nodes: LayoutNode[];
    edges: LayoutEdge[];
  }; // the x and y should not mess with user x and y used in manual layout
  nodeMap: {
    [nodeId: string]: LayoutNode;
  };
  // ? why needed
  nodePositionMap: {
    [nodeId: string]: number[];
  };
  timeManager: TimeManager;
  intervalScale: scaleThreshold;
  constructor(options) {
    super();
    this.name = 'TimelineLayout';
    this.options = {
      ...defaultOptions,
      ...options,
    };
    this.graph = null;
    this.timeManager = new TimeManager();
    // ? why needed
    this.nodePositionMap = {};
  }

  // not used in this layout since generateTimelineLayout will create the nodes
  initializeGraph(graph) {
    this.updateGraph(graph);
  }

  notifyLayoutComplete() {
    this.callbacks.onLayoutChange();
    this.callbacks.onLayoutDone();
  }

  start() {
    this.generateTimelineLayout();
    this.notifyLayoutComplete();
  }

  resume() {
    this.notifyLayoutComplete();
  }

  generateTimelineLayout() {
    this.graph.reset();
    const xScale = this.timeManager.getTimescale(
      this.graph.initAt,
      this.minX,
      this.maxX,
      this.zoom
    );

    const format = xScale.tickFormat();
    // get new labels for axis
    const ticks = xScale.ticks().map((t, i) => {
      return new Node({
        id: `timeline-node-${i + 1}`,
        x: xScale(t),
        y: 0,
        locked: true,
        data: {
          name: format(t),
        },
      });
    });

    const lines = xScale.ticks(20).map((t, i) => {
      return new Node({
        id: `timeline-line-${i}`,
        x: xScale(t),
        y: 0,
        yPixelOffset: 10,
        locked: true,
        data: {
          name: '|',
        },
      });
    });

    this.graph.batchAddNodes([...ticks, ...lines]);
    this.updateGraph(this.graph);
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

  getLayoutNodes = (): LayoutNode[] => {
    return this.layoutGraph.nodes;
  };

  getNodePosition = (node: Node): number[] => {
    const { x, y } = this.nodeMap[node.id];
    return [x, y];
    //this.nodePositionMap[node.getId()];
  };

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

export { TimelineLayout };
