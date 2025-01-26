import { Graph } from '../Graph.js';
import { Node } from '../Node.js';
import { Edge } from '../Edge.js';
import { ForceLayout } from './ForceLayout.js';
import { TreeLayout } from './TreeLayout.js';
import { TimelineLayout } from './TimelineLayout.js';

export enum LAYOUT_STATE {
  INIT,
  START,
  CALCULATING,
  DONE,
  ERROR,
}

// Layout engine controls the graph data and layout calculation
class LayoutEngine {
  graph: Graph | null;
  layout: ForceLayout | TreeLayout | TimelineLayout;
  layoutState: LAYOUT_STATE;
  lastUpdate: number; // timestamp
  public callbacks: {
    onLayoutChange: () => void;
    onLayoutDone: () => void;
    onLayoutError: () => void;
  };
  constructor() {
    // graph data
    this.graph = null;
    // layout algorithm
    this.layout = null;
    // layout state
    this.layoutState = LAYOUT_STATE.INIT;
    // last layout update time stamp
    this.lastUpdate = 0;
    // event callbacks
    this.callbacks = {
      onLayoutChange: () => {
        //
      },
      onLayoutDone: () => {
        //
      },
      onLayoutError: () => {
        //
      },
    };
  }

  setExtent(minX: number, minY: number, maxX: number, maxY: number): void {
    if (this.layout) {
      // @ts-ignore somehow the parent methods are not visible to TS
      this.layout.setExtent(minX, minY, maxX, maxY);
    }
  }

  setZoom(zoom: number) {
    if (this.layout) {
      // @ts-ignore somehow the parent methods are not visible to TS
      this.layout.setZoom(zoom);
    }
  }

  /** Getters */

  getNodes = (filterKeys: string[]): Node[] => {
    if (this.layout.clusterRadius) {
      const clusterNodes = this.layout.getClusterNodes();
      const nodes = [];
      for (const clusterNode of clusterNodes) {
        const existingNode = this.graph.findNode(clusterNode.id);
        nodes.push(
          existingNode ||
            new Node({
              id: clusterNode.id,
            })
        );
      }

      return nodes;
    }
    return this.graph.getNodes(filterKeys);
  };

  getEdges = (): Edge[] => {
    if (this.layout.clusterRadius) {
      // todo: aggregate edges in cluster
    }
    return this.graph.getEdges();
  };

  getGraph = () => this.graph;

  getLayout = () => this.layout;

  getNodePosition = (node: Node) => this.layout.getNodePosition(node);

  getEdgePosition = edge => this.layout.getEdgePosition(edge);

  getLayoutLastUpdate = () => this.lastUpdate;

  getLayoutState = () => this.layoutState;

  /** Operations on the graph */

  lockNodePosition = (node, x, y) => {
    this.layout.lockNodePosition(node, x, y);
  };

  unlockNodePosition = node => {
    this.layout.unlockNodePosition(node);
  };

  clear = () => {
    if (this.layout) {
      this.layout.unregisterCallbacks();
    }
    this.graph = null;
    this.layout = null;
    this.layoutState = LAYOUT_STATE.INIT;
  };

  /** Event callbacks */

  registerCallbacks = callbacks => {
    this.callbacks = callbacks;
  };

  unregisterCallbacks = () => {
    this.callbacks = {
      onLayoutChange: () => {
        //
      },
      onLayoutDone: () => {
        //
      },
      onLayoutError: () => {
        //
      },
    };
  };

  onLayoutChange = () => {
    this.lastUpdate = Date.now();
    this.layoutState = LAYOUT_STATE.CALCULATING;
    if (this.callbacks.onLayoutChange) {
      this.callbacks.onLayoutChange();
    }
  };

  onLayoutDone = () => {
    this.layoutState = LAYOUT_STATE.DONE;
    if (this.layout.clusterRadius) {
      this.layout.createCluster(
        this.layout.getLayoutNodes(),
        this.layout.clusterRadius
      );
    }
    if (this.callbacks.onLayoutDone) {
      this.callbacks.onLayoutDone();
    }
  };

  onLayoutError = () => {
    this.layoutState = LAYOUT_STATE.ERROR;
    if (this.callbacks.onLayoutError) {
      this.callbacks.onLayoutError();
    }
  };

  /** Layout calculations */

  run = (graph, layout) => {
    this.clear();
    this.graph = graph;
    this.layout = layout;
    this.layout.initializeGraph(graph);
    this.layout.registerCallbacks({
      onLayoutChange: this.onLayoutChange,
      onLayoutDone: this.onLayoutDone,
      onLayoutError: this.onLayoutError,
    });
    this.layout.start();
    this.layoutState = LAYOUT_STATE.START;
  };

  resume = () => {
    if (this.layout) {
      this.layout.resume();
    }
  };

  stop = () => {
    if (this.layout) {
      this.layout.stop();
    }
  };
}

export { LayoutEngine };
