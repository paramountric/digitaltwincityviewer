import { Node } from './Node.js';

type EdgeType = 'LINE' | 'SPLINE_CURVE' | 'PATH' | 'CURVE';

type EdgeProps = {
  id: string;
  type: EdgeType;
  sourceId: string;
  targetId: string;
  data?: any;
  directed?: boolean;
};
// Basic data structure of an edge
class Edge {
  id: string;
  type: EdgeType;
  sourceId: string;
  targetId: string;
  directed: boolean;
  data: any;
  isEdge: boolean;
  // for keeping node instances in local data structure, set them directly on edge instance
  public target?: Node;
  public source?: Node;
  constructor({
    id,
    type,
    sourceId,
    targetId,
    data = {},
    directed = false,
  }: EdgeProps) {
    // the unique uuid of the edge
    this.id = id;
    // type of edge
    this.type = type;
    // the ID of the source node
    this.sourceId = sourceId;
    // the ID of the target node
    this.targetId = targetId;
    // whether the edge is directed or not
    this.directed = directed;
    // origin data reference of the edge
    this.data = data;
    // check the type of the object when picking engine gets it.
    this.isEdge = true;
  }

  /**
   * Return the ID of the edge
   * @return {String|Number} - the ID of the edge.
   */
  getId() {
    return this.id;
  }

  /**
   * Return whether the edge is directed or not.
   * @return {Boolean} true if the edge is directed.
   */
  isDirected() {
    return this.directed;
  }

  /**
   * Get the ID of the source node.
   * @return {String|Number} the ID of the source node.
   */
  getSourceNodeId() {
    return this.sourceId;
  }

  /**
   * Get the ID of the target node.
   * @return {String|Number} the ID of the target node.
   */
  getTargetNodeId() {
    return this.targetId;
  }

  /**
   * Return of the value of the selected property key.
   * @param  {String} key - property key.
   * @return {Any} - the value of the property.
   */
  getPropertyValue(key) {
    // try to search the key within this object
    if (this[key]) {
      return this[key];
    }
    // try to search the key in the original data reference
    else if (this.data[key]) {
      return this.data[key];
    }
    // otherwise, not found
    return '';
  }

  /**
   * Set the origin data as a reference.
   * @param {Any} data - the origin data.
   */
  setData(data) {
    this.data = data;
  }

  /**
   * Update a data property.
   * @param {String} key - the key of the property
   * @param {Any} value - the value of the property.
   */
  setDataProperty(key, value) {
    this.data[key] = value;
  }
}

export { Edge };
