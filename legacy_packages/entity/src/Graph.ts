import { Edge } from './Edge.js';
import { Node } from './Node.js';

// Basic graph data structure
class Graph {
  nodeMap: {
    [nodeId: string]: Node;
  };
  edgeMap: {
    [edgeId: string]: Edge;
  };
  name: number;
  lastUpdate: number;
  // this is set to current time as the graph is initialized and gives the NOW of the viewer timeline
  initAt: number;
  cache: {
    nodes: Node[];
    edges: Edge[];
  };
  lastCacheUpdate: number;
  // local state of loading, however this could come from backend if a process is connected to the node
  // when the graph is updated, this state is updated, if a specific node is updated - change the node by ref and this cache separately to avoid traversing
  isLoading: {
    [nodeId: string]: boolean;
  };
  /**
   * The constructor of the Graph class.
   * @param  {Object} graph - copy the graph if this exists.
   */
  constructor(graph = null) {
    // list object of nodes/edges
    this.nodeMap = {};
    this.edgeMap = {};
    // for identifying whether performing dirty check when streaming new data.
    // If the name of the graph is not specified,
    // will fall back to current time stamp.
    this.name = Date.now();
    // the last updated timestamp of the graph.
    this.lastUpdate = 0;

    this.initAt = Date.now();

    // cached data: create array data from maps.
    this.cache = {
      nodes: [],
      edges: [],
    };
    this.lastCacheUpdate = -1;

    // copy the graph if it exists in the parameter
    if (graph) {
      // start copying the graph
      this.nodeMap = graph.nodeMap;
      this.edgeMap = graph.edgeMap;
      this.name = graph && graph.name;
    }
  }

  /**
   * update last update time stamp
   */
  touchLastUpdate() {
    // update last update time stamp
    this.lastUpdate += 1;
  }

  /**
   * update local data cache and lastCacheUpdate.
   */
  updateCache() {
    // create array data from maps.
    this.cache = {
      nodes: Object.values(this.nodeMap),
      edges: Object.values(this.edgeMap),
    };
    this.lastCacheUpdate = this.lastUpdate;
  }

  /**
   * Set graph name (not sure yet if timestamp is used)
   * @param {number} name
   */
  setGraphName(name: number) {
    this.name = name;
  }

  /** Get the name of the graph. Default value is the time stamp when creating this graph.
   * @return {string} graph name.
   */
  getGraphName() {
    return this.name;
  }

  /**
   * Add a new node to the graph.
   * @param {Node} node - expect a Node object to be added to the graph.
   */
  addNode(node) {
    if (node.isLoading) {
      this.isLoading[node.getId()] = true;
    }
    // add it to the list and map
    this.nodeMap[node.getId()] = node;
    // update last update time stamp
    this.touchLastUpdate();
  }

  /**
   * Batch add nodes to the graph.
   * @param  {Node[]} nodes - a list of nodes to be added.
   */
  batchAddNodes(nodes: Node[]) {
    // convert an array of objects to an object
    this.nodeMap = nodes.reduce(
      (res, node) => {
        res[node.getId()] = node;
        if (node.isLoading) {
          this.isLoading[node.getId()] = true;
        }
        return res;
      },
      { ...this.nodeMap } // is this efficient?
    );
    this.touchLastUpdate();
  }

  /**
   * Get all the nodes of the graph.
   * @return {Node[]} - get all the nodes in the graph.
   */
  getNodes(filterKeys?: string[]) {
    if (this.lastCacheUpdate !== this.lastUpdate) {
      this.updateCache();
    }
    return this.cache.nodes.filter(node => {
      if (filterKeys) {
        if (filterKeys.find(s => node.getPropertyValue(s))) {
          return true;
        } else {
          return false;
        }
      } else {
        return true;
      }
    });
  }

  /**
   * Get the node map of the graph. The key of the map is the ID of the nodes.
   * @return {Object} - a map of nodes keyed by node IDs.
   */
  getNodeMap() {
    return this.nodeMap;
  }

  /**
   * Find a node by id
   * @param  {String} nodeId The id of the node
   * @return {Object} Node
   */
  findNode(nodeId) {
    return this.nodeMap[nodeId];
  }

  /**
   * Add a new edge to the graph.
   * @param {Edge} edge - expect a Edge object to be added to the graph.
   */
  addEdge(edge: Edge) {
    const sourceNode = this.findNode(edge.getSourceNodeId());
    const targetNode = this.findNode(edge.getTargetNodeId());

    if (!sourceNode || !targetNode) {
      console.log(
        `Unable to add edge ${edge.id},  source or target node is missing.`
      );
      return;
    }

    this.edgeMap[edge.getId()] = edge;
    sourceNode.addConnectedEdges([edge]);
    targetNode.addConnectedEdges([edge]);
    this.touchLastUpdate();
  }

  /**
   * Batch add edges to the graph
   * @param  {Edge[]} edges - a list of edges to be added.
   */
  batchAddEdges(edges: Edge[]) {
    edges.forEach(edge => this.addEdge(edge));
    this.touchLastUpdate();
  }

  /**
   * Remove a node from the graph by node ID
   * @param  {String|Number} nodeId - the ID of the target node.
   */
  removeNode(nodeId) {
    const node = this.findNode(nodeId);
    if (!node) {
      console.log(`Unable to remove node ${nodeId} - doesn't exist`);
      return;
    }
    // remove all edges connect to this node from map
    node.getConnectedEdges().forEach(e => {
      delete this.edgeMap[e.getId()];
    });
    // remove the node from map
    delete this.nodeMap[nodeId];
    this.touchLastUpdate();
  }

  /**
   * Get all the edges of the graph.
   * @return {Edge[]} get all the edges in the graph.
   */
  getEdges() {
    if (this.lastCacheUpdate !== this.lastUpdate) {
      this.updateCache();
    }
    return this.cache.edges;
  }

  /**
   * Get the edge map of the graph. The key of the map is the ID of the edges.
   * @return {Object} - a map of edges keyed by edge IDs.
   */
  getEdgeMap() {
    return this.edgeMap;
  }

  /**
   * Remove an edge from the graph by the edge ID
   * @param  {String|Number} edgeId - the target edge ID.
   */
  removeEdge(edgeId) {
    const edge = this.findEdge(edgeId);
    if (!edge) {
      console.log(`Unable to remove edge ${edgeId} - doesn't exist`);
      return;
    }
    const sourceNode = this.findNode(edge.getSourceNodeId());
    const targetNode = this.findNode(edge.getTargetNodeId());

    delete this.edgeMap[edgeId];
    sourceNode.removeConnectedEdges([edge]);
    targetNode.removeConnectedEdges([edge]);
    this.touchLastUpdate();
  }

  /**
   * Find the edge by edge ID.
   * @param  {String|Number} id - the target edge ID
   * @return {Edge} - the target edge.
   */
  findEdge(edgeId) {
    return this.edgeMap[edgeId];
  }

  /**
   * Return all the connected edges of a node by nodeID.
   * @param  {String|Number} nodeId - the target node ID
   * @return {Edge[]} - an array of the connected edges.
   */
  getConnectedEdges(nodeId) {
    const node = this.findNode(nodeId);
    if (!node) {
      console.log(`Unable to find node ${nodeId} - doesn't exist`);
      return [];
    }
    return node.getConnectedEdges();
  }

  /**
   * Return all the sibling nodes of a node by nodeID.
   * @param  {String|Number} nodeId - the target node ID
   * @return {Node[]} - an array of the sibling nodes.
   */
  getNodeSiblings(nodeId) {
    const node = this.findNode(nodeId);
    if (!node) {
      console.log(`Unable to find node ${nodeId} - doesn't exist`);
      return [];
    }
    return node
      .getSiblingIds()
      .map(siblingNodeId => this.findNode(siblingNodeId));
  }

  /**
   * Get the degree of a node.
   * @param  {String|Number} nodeId - the target node ID.
   * @return {Number} - the degree of the node.
   */
  getDegree(nodeId) {
    const node = this.findNode(nodeId);
    if (!node) {
      console.log(`Unable to find node ${nodeId} - doesn't exist`);
      return 0;
    }
    return node.getDegree();
  }

  /**
   * Clean up all the nodes in the graph.
   */
  resetNodes() {
    this.nodeMap = {};
    this.touchLastUpdate();
  }

  /**
   * Clean up all the edges in the graph.
   */
  resetEdges() {
    this.edgeMap = {};
    this.touchLastUpdate();
  }

  /**
   * Clean up everything in the graph.
   */
  reset() {
    this.resetNodes();
    this.resetEdges();
    this.touchLastUpdate();
  }

  /**
   * Return true if the graph is empty.
   * @return {Boolean} Return true if the graph is empty.
   */
  isEmpty() {
    return Object.keys(this.nodeMap).length === 0;
  }

  /**
   * Check the equality of two graphs data by checking last update time stamp
   * @param  {Object} g Another graph to be compared against itself
   * @return {Bool}   True if the graph is the same as itself.
   */
  equals(g) {
    if (!g || !(g instanceof Graph)) {
      return false;
    }
    return this.lastUpdate === g.lastUpdate;
  }
}

export { Graph };
