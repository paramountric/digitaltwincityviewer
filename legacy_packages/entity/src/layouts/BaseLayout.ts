import { Cluster } from '../Cluster.js';
import { LayoutNode } from './LayoutNode.js';
import { Node } from '../Node.js';

// All the layout classes are extended from this base layout class.
class BaseLayout {
  public name: string;
  public options: any;
  public zoom = 0;
  public minX = -512;
  public minY = -512;
  public maxX = 512;
  public maxY = 512;
  private cluster: Cluster;
  // use this as bool to determine if cluster should be generated with createCluster method
  public clusterRadius?: number;
  public callbacks: {
    onLayoutChange: () => void;
    onLayoutDone: () => void;
    onLayoutError: () => void;
  };

  constructor() {
    this.name = 'BaseLayout';
    this.options = {};
    this.cluster = new Cluster();
    this.callbacks = {
      onLayoutChange: () => {
        // default to nothing
      },
      onLayoutDone: () => {
        // default to nothing
      },
      onLayoutError: () => {
        // default to nothing
      },
    };
  }

  createCluster(nodes: LayoutNode[], clusterRadius: number): void {
    this.cluster.create(nodes, clusterRadius);
  }

  getClusterNodes(): LayoutNode[] {
    return this.cluster.getNodes(
      this.minX,
      this.minY,
      this.maxX,
      this.maxY,
      this.zoom
    );
  }

  setExtent(minX: number, minY: number, maxX: number, maxY: number): void {
    this.minX = minX;
    this.minY = minY;
    this.maxX = maxX;
    this.maxY = maxY;
  }

  setZoom(zoom: number) {
    this.zoom = zoom;
  }

  /**
   * Register event callbacks ({onLayoutChange, onLayoutDone, onLayoutError})
   * @param  {Object} callbacks
   *         {Function} callbacks.onLayoutChange:
   *           a callback will be triggered on every layout calculation iteration
   *         {Function} callbacks.onLayoutDone:
   *           a callback will be triggered when the layout calculation is done
   *         {Function} callbacks.onLayoutError:
   *           a callback will be triggered when the layout calculation goes wrong
   */
  registerCallbacks(callbacks) {
    this.callbacks = callbacks;
  }

  /**
   * unregister all event callbacks.
   */
  unregisterCallbacks() {
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

  /**
   * Check the equality of two layouts
   * @param  {Object} layout The layout to be compared.
   * @return {Bool}   True if the layout is the same as itself.
   */
  equals(layout) {
    if (!layout || !(layout instanceof BaseLayout)) {
      return false;
    }
    return this.name === layout.name && this.options === layout.options;
  }

  /** virtual functions: will be implemented in the child class */

  // first time to pass the graph data into this layout
  initializeGraph(graph) {
    //
  }
  // update the existing graph
  updateGraph(graph) {
    //
  }
  // start the layout calculation
  start() {
    //
  }
  // resume the layout calculation
  resume() {
    //
  }
  // stop the layout calculation
  stop() {
    //
  }
  // access the position of the node in the layout
  getNodePosition(node: Node) {
    if (node.isCluster) {
      return this.cluster.getNodePosition(node.id, node.zoom);
    }
    return [0, 0];
  }
  // access the layout information of the edge
  getEdgePosition(edge) {
    return {
      type: 'LINE',
      sourcePosition: [0, 0],
      targetPosition: [0, 0],
      sourceDirection: [1, 0],
      targetDirection: [1, 0],
      controlPoints: [],
    };
  }

  /**
   * Pin the node to a designated position, and the node won't move anymore
   * @param  {Object} node Node to be locked
   * @param  {Number} x    x coordinate
   * @param  {Number} y    y coordinate
   */
  lockNodePosition(node, x, y) {
    //
  }

  /**
   * Unlock the node, the node will be able to move freely.
   * @param  {Object} node Node to be unlocked
   */
  unlockNodePosition(node) {
    //
  }
}

export { BaseLayout };
