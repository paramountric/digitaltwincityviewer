import { Edge } from './Edge.js';

// todo: different nodes:
// BaseNode (only the first node for the stream),
// BucketNode (wrapper object for a collection of entities),
// TypeNode (or EntityTypeNode for a node of type itself),
// TypeNodeGroup (not sure,
// but if different type nodes need to be grouped),
// EntityNode (this is the instance itself),
// EntityNodeGroup (collection of entities/instances),
// PropertyNode (the nodes of the property in data object, or properties object in Entity)
// Also is the Entity separate from the EntityNode? since entity should be linked data and the metadata of the node should not be in the Entity

type NodeState =
  | 'default'
  | 'hover'
  | 'dragging'
  | 'selected'
  | 'selected-hover'
  | 'empty';

type NodeProps = {
  id: string;
  type?: string; // internal node type todo: create enum
  types?: string[]; // linked data types
  createdAt?: string;
  data?: any;
  // this will "lock" the node in the layout engine if x and y are defined
  locked?: boolean;
  x?: number;
  y?: number;
  // this is offset by pixels to keep distance while zooming
  xPixelOffset?: number;
  yPixelOffset?: number;
  zoom?: number;
  isCluster?: boolean;
  parentId?: string;
  state?: string;
  isEmpty?: boolean;
  modelMatrix?: number[]; // 4x4
  bounds?: [number, number, number, number, number, number]; // minx, miny, minz, maxx, maxy, maxz
  vertices?: number[]; // x, y, z, x, y, z,...
  faces?: number[]; // triangles
  collisionRadius?: number; // for distance between nodes in graph viz
};

// type NodeData = {
//   catalogType: 'IFC' | 'EPD' | 'PRODUCT'; // <- this describes the supported "Bucket"-types
//   entities: Entity[]; // use datasetId to separate the catalog items
//   name: string;
// };

// Todo: rename to ExplorationNode
// todo: also, think about the difference between ExplorationNode and LayoutNode, how the bbType could be used (there are some structural nodes that has to be mixed with EntityNodes in the graph)
// -> the bbType should have Base | Bucket | Group | Entity where Base and Bucket are application level types, Group is any collection of Entity. Entity is the real data
// Basic data structure of a node
class Node {
  id: string;
  type: string; // internal type
  timeOffset: number;
  // data cache
  private data: any;
  // the origin of the data as in warehouse
  private streamId?: string;
  // filter for the cache, url/gql generating
  types: string[];
  // filter for the cache, url/gql generating
  private entityIds?: string[];
  // filter for the cache, url/gql generating
  public pagination?: number; // by default the first 10 (or something) entities are shown
  // the selection is filtered from this node (base or bucket node)
  public parentId?: string;
  // helper for tree traversal
  public isRoot? = false;
  // helper for layout engine to know where to look for the node position (in cluster or in layout)
  public isCluster? = false;
  // if this is a cluster it could be connected to a certain zoom level
  public zoom?: number;
  // use this to show processing on a node with animation
  public isLoading: boolean;
  // for interaction on the node (try to move this to LayoutNode? <- will not work if the data on layer is Node)
  // todo: separate state into isHover, isSelected, isDragging because the combinations are needed
  public state: NodeState;
  // this is used in interaction manager to know which callback to use
  isNode: boolean;
  // experimenting with filter selection for styling.. todo: create a proper filter mechanism
  isEmpty: boolean;
  public createdAt: string; // datetime when the node was added <- this must generate the x relative to NOW = x = 0 (cartesian)
  // Note that x and y is for storing user manipulated positions in db -> layout nodes are used for dynamic positioning
  public x?: number;
  public y?: number;
  // For texts and panels that needs to be fixed pixel offsetted relative to other node
  public xPixelOffset?: number;
  public yPixelOffset?: number;
  // if this is true, the x and y will "lock" the node at the position (but it's useful to enable to "unlock" it and still keep the x, y)
  public locked?: boolean;
  public radius?: number;
  public collisionRadius: number;
  // references to eges
  private connectedEdges: { [edgeId: string]: Edge };
  bounds?: [number, number, number, number, number, number]; // minx, miny, minz, maxx, maxy, maxz
  modelMatrix?: number[]; // this together with Box can display the entity
  // mesh
  faces?: number[];
  vertices?: number[];
  constructor(props: NodeProps) {
    this.id = props.id;
    this.type = props.type || 'NoType';
    if (props.createdAt) {
      this.createdAt = props.createdAt;
    }
    this.types = props.types || [];
    if (props.x || props.x === 0) {
      this.x = props.x;
    }
    if (props.y || props.y === 0) {
      this.y = props.y;
    }
    this.locked = Boolean(props.locked);
    if (props.xPixelOffset || props.xPixelOffset === 0) {
      this.xPixelOffset = props.xPixelOffset;
    }
    if (props.yPixelOffset || props.yPixelOffset === 0) {
      this.yPixelOffset = props.yPixelOffset;
    }
    if (props.zoom || props.zoom === 0) {
      this.zoom = props.zoom;
    }
    if (props.isCluster) {
      this.isCluster = props.isCluster;
    }
    if (props.parentId) {
      this.parentId = props.parentId;
    }
    if (props.bounds) {
      this.bounds = props.bounds;
    }
    if (props.modelMatrix) {
      this.modelMatrix = props.modelMatrix;
    }
    if (props.vertices) {
      this.vertices = props.vertices;
    }
    if (props.faces) {
      this.faces = props.faces;
    }
    if (props.faces) {
      this.faces = props.faces;
    }
    this.collisionRadius = props.collisionRadius || 0;
    // the interaction state of the node
    this.state = (props.state || 'default') as NodeState;
    // keep a reference to origin data
    this.data = props.data || {};
    // derived properties
    // list objects
    this.connectedEdges = {};
    // check the type of the object when picking engine gets it.
    this.isNode = true;
    this.isEmpty = props.isEmpty || false;
  }

  getId() {
    return this.id;
  }

  getIdWithCommit() {
    const commitId = this.getPropertyValue('commitId') || 'no-commit';
    return `${this.getId()}-${commitId}`;
  }

  addType(type: string) {
    if (!this.types.find(t => t === type)) {
      this.types.push(type);
    }
  }

  hasType(type: string) {
    return Boolean(this.types.find(t => t === type));
  }

  removeType(type: string) {
    const types = this.types.filter(t => t !== type);
    this.types = types;
  }

  /**
   * Return the degree of the node -- includes in-degree and out-degree
   * @return {Number} - the degree of the node.
   */
  getDegree() {
    return Object.keys(this.connectedEdges).length;
  }

  /**
   * Return the in-degree of the node.
   * @return {Number} - the in-degree of the node.
   */
  getInDegree() {
    const nodeId = this.getId();
    return this.getConnectedEdges().reduce((count, e) => {
      const isDirected = e.isDirected();
      if (isDirected && e.getTargetNodeId() === nodeId) {
        count += 1;
      }
      return count;
    }, 0);
  }

  /**
   * Return the out-degree of the node.
   * @return {Number} - the out-degree of the node.
   */
  getOutDegree() {
    const nodeId = this.getId();
    return this.getConnectedEdges().reduce((count, e) => {
      const isDirected = e.isDirected();
      if (isDirected && e.getSourceNodeId() === nodeId) {
        count += 1;
      }
      return count;
    }, 0);
  }

  /**
   * Return all the IDs of the sibling nodes.
   * @return {String[]} [description]
   */
  getSiblingIds() {
    const nodeId = this.getId();
    return this.getConnectedEdges().reduce((siblings, e) => {
      if (e.getTargetNodeId() === nodeId) {
        siblings.push(e.getSourceNodeId());
      } else {
        siblings.push(e.getTargetNodeId());
      }
      return siblings;
    }, []);
  }

  /**
   * Return all the connected edges.
   * @return {Object[]} - an array of the connected edges.
   */
  getConnectedEdges() {
    return Object.values(this.connectedEdges);
  }

  /**
   * Return of the value of the selected property key.
   * @param  {String} key - property key.
   * @return {Any} - the value of the property or undefined (not found).
   */
  getPropertyValue(key) {
    if (key === 'type') {
      return this.types.join(',');
    }
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

  getValidState() {
    if (this.data.noSchema) {
      return 'no-schema';
    }
    if (this.data.valid === true) {
      return 'valid';
    }
    if (this.data.valid === false) {
      return 'not-valid';
    }
    return 'no-state';
  }

  getPropertyValues() {
    const propertyValues: {
      [key: string]: number | string | boolean;
    } = {};
    for (const key of Object.keys(this.data)) {
      propertyValues[key] = this.getPropertyValue(key);
    }
    return propertyValues;
  }

  /**
   * Set the new node data.
   * @param {Any} data - the new data of the node
   */
  setData(data) {
    this.data = data;
  }

  getData() {
    return this.data;
  }

  /**
   * Update a data property.
   * @param {String} key - the key of the property
   * @param {Any} value - the value of the property.
   */
  setDataProperty(key, value) {
    this.data[key] = value;
  }

  /**
   * Set node state
   * @param {String} state - one of NODE_STATE
   */
  setState(state) {
    console.log(state);
    this.state = state;
  }

  /**
   * Add connected edges to the node
   * @param {Edge[]} an edge or an array of edges to be added to this.connectedEdges
   */
  addConnectedEdges(edges: Edge[]) {
    this.connectedEdges = edges.reduce((res, e: Edge) => {
      res[e.id] = e;
      return res;
    }, this.connectedEdges);
  }

  /**
   * Remove edges from this.connectedEdges
   * @param  {Edge[]} an edge or an array of edges to be removed from this.connectedEdges
   */
  removeConnectedEdges(edges: Edge[]) {
    edges.forEach(e => {
      delete this.connectedEdges[e.id];
    });
  }

  /**
   * Clear this.connectedEdges
   */
  clearConnectedEdges() {
    this.connectedEdges = {};
  }
}

export { Node };
