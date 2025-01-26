import KDBush from 'kdbush';
import { Entity } from './Entity.js';
import { circularSankey, SankeyNode, SankeyLink } from './Sankey.js';
// Exploration of entities is a user centric experience of configuring the flow by iteratively add steps

// 1. A first step is added, see ExplorationStep (generate a single column, can be expanded to viewers) <- force this to same type! no! because building is composed by many types... what I mean is that the parent entity should be same type, for example "building" and when zooming in there can be different types
// 2. Options for expanding left or right (types, propertyValue, external relationships)
// 3. Now links can be splitted and a graph is created
// 4. Any node can "meet" from another step (query and force reverse direction (upstream or downstream))
// 5. Example query a building, and query for components and see how much in relation to building (height of node)

// This is what is included in one node
// ! think about this as a query to db, that the user creates and saves -> when it comes back from db it should be rendered - the combination is flexible
// ! also, create wrappers (base, bucket) that restricts the creation of the selection (think that some datasets are completely unknown, like geojson, and some are complicated but from schema, like IFC and CityGML)
export type EntitySelection = {
  startDate?: Date;
  endDate?: Date;
  bounds?: [minX: number, minY: number, maxX: number, maxY: number];
  entityIds?: string[]; // if a new entity is selected after a while, the existing display needs to be updated (for example adding a new building)
  // ! types does not really work properly now -> it's part of the id, so it's used there to avoid circular links, but should a filter be used (because the selection is already used for query -> so it should already be correct..)?
  types?: string[]; // the entity types that are relevant, without it, it would be possible to search across all types for this step
  datasetIds?: string[]; // in case type is the same and entityId cannot be used to separate types between steps
  // The selectedPropertyKey will be used to find the index here, and the value in atomics
  numericPropertyKeys?: string[]; // this is to store the other property values in the atomics, if not everything needs a reload if switching property, ex volume -> co2
  // The groupBy key in node can be used to group by one of the following keys: (values are in the atomics)
  categoricalPropertyKeys?: string[];
  // These keys will reach from this node to other nodes, ex "downstream", "upstream"
  externalRelationshipKeys?: string[];
  // These keys will only be used to find atomics for this node, ex "contains", "composes"
  internalRelationshipKeys?: string[];
};

// todo: this should be put on a link?
export type EntityMapping = {
  typeMapping?: {
    [fromType: string]: string; // to map this node from other type names in OTHER NODE, ex IFCBeam <- BeamProduct
  };
  propertyMapping?: {
    [fromPropertyKey: string]: string; // to map this node from other type names in OTHER NODE, ex NetVolume <- volume
  };
  relationshipMapping?: {
    [fromRelationshipKey: string]: string; // to any other relationshipKey to make a explorative connection in data (maybe even update the entities if authorized)
  };
};

// from the query result (using the selection)
export type EntityMetadata = {
  numEntities: number;
  // the dates here are from loaded entites, not necessarily the same as in query
  startDate: Date; // use the min observedAt in entities
  endDate: Date; // use the max observedAt OR a reasonable min range
  // suggest to split by type if link group is by entityId
  foundTypes: {
    [type: string]: number;
  };
  // suggest to follow the relationships, potentially creating a new step if entities are not loaded
  // (actually, create a new step regardless but only optionally fetch again)
  foundRelationships: {
    [type: string]: number;
  };
  // suggest to group by category, some of the entites might not have the category and should just continue without grouping through the chain
  foundCategories: {
    [type: string]: number;
  };
  // suggest to reload using another property, but this should probably be globally (in the top of the window)
  foundNumericProperties: {
    [type: string]: {
      min: number;
      max: number;
      sum: number;
      count: number;
    };
  };
};

// no longer atomic... but the purpose here is to store the minial set of data for exploration without need to fetch the original entities
// todo: can the atomic be skipped, and always load releant entities? Since the metadata is on the nodes. The entities can be in redis (or even db)
// ! if the atomics should be loaded to client (for quick exploration) they need to be extremely compact
// ! for a city with thousands of buildings and other objects?
export type AtomicNode = {
  id: string; // use node.id + entityid (this means the query = unique for the node (check this, because nodes should not be exactly the same) and the entity id (also unique obviously))
  entityId: string; // or just use the last part of id?
  type: string;
  // the selectedPropertyKey index should be used to find the value here for the selected property
  numericPropertyValues: (null | number)[]; // matches selection
  categoricalPropertyValues: string[]; // matches selection (no value is '')
  internalRelationshipObjects: string[]; // matches selection
  externalRelationshipObjects: string[]; // matches selection
  // after link groups are created this is how to get the relevant atomics for clustering
  linkGroupId?: string;
  // after initial layout is created (sankey, graph, etc), the x and y values can be calculated (then the clustering can be done)
  x?: number;
  y?: number;
  bounds?: number[]; // this is the world bounds, used to center nodes
  modelMatrix?: number[]; // if the entity has local position or bounds representation, use this matrix (note that it can be used in cluster to merge representations)
};

export type NodeClusterSetting = {
  id: string;
  value: number;
  layout: 'vertical' | 'horizontal' | 'delaunay';
  // this must be in cartesian space, not pixels!
  x0: number;
  x1: number;
  y0: number;
  y1: number;
};

// todo: rename to ExplorationStep since this is a linked list, and we have the SankeyNode and the AtomicNode (rename the AtomicNode to Atomic? Since Atomic links are never saved, just LinkGroup) - too many nodes
// Each step is for one selection of entities given by types, entityIds and relationshipKeys
// Each group is a grouping of this selection
export class ExplorationNode {
  id: string;
  child: ExplorationNode | null;
  childConnection: 'entityId' | 'object'; // how to map the atomicNodes from this node to child node
  selectedPropertyKey: string; // this is in case the queries will use different propertyKey representing same kind of value, ex 'volume', 'NetVolume'
  isLoading: boolean;
  isLoaded: boolean;
  metadata: EntityMetadata;
  selection: EntitySelection;
  groupBy: string; // this propertyKey is matched to selection.categoricalPropertyKeys (for the moment only one grouping is possible, but in the future it could be possible to create array here)
  groupLimit: 50;
  // note that each entityId can only be represented once in each node
  atomicNodes: Map<string, AtomicNode> = new Map();
  // todo: the nodes with useDataFromNodeId could potentially wait for all other nodes to be loaded, this would make it possible to skip the order in Exploration.nodes
  useDataFromNodeId?: string; // go to another node and find data there (a subset, or a different grouping), using the new selection, but no need to query the database
  isPlaceholder?: boolean; // this node needs to be filled even if no entities where found -> use this to "design the supply chain" and forcing a flow
  constructor(selection: EntitySelection, groupBy = '') {
    this.selection = selection;
    this.id = this.generateNodeId();
    this.child = null;
    this.groupBy = groupBy;
    this.metadata = {
      foundTypes: {},
      foundCategories: {},
      numEntities: 0,
      startDate: new Date(),
      endDate: new Date(),
      foundRelationships: {},
      foundNumericProperties: {},
    };
  }
  addNode(node: ExplorationNode) {
    // this is a linked list for now, adding a node to a node must insert the node at this place
    if (this.child) {
      node.addNode(this.child);
    }
    this.child = node;
  }
  removeChild(keepChain?: boolean) {
    if (keepChain && this.child.child) {
      this.child = this.child.child;
    } else {
      this.child = null;
    }
  }
  // this node id is used for grouping atomics
  generateNodeId(): string {
    const ids = this.selection.entityIds || [];
    const types = this.selection.types || [];
    const numericPropertyKeys = this.selection.numericPropertyKeys || [];
    const categoricalPropertyKeys =
      this.selection.categoricalPropertyKeys || [];
    // const externalRelationshipKeys = this.selection.externalRelationshipKeys || [];
    // const internalRelationshipKeys = this.selection.internalRelationshipKeys || [];
    let key = [
      ...ids,
      ...types,
      ...numericPropertyKeys,
      ...categoricalPropertyKeys,
    ].join('-');
    if (this.groupBy) {
      key += this.groupBy;
    }
    return key;
  }
  // similar to node.id but uses the values instead of keys
  // todo: group by both entityId and types? or other combinations?
  generateNodeGroupId(atomic: AtomicNode): string {
    const ids = this.selection.entityIds || [];
    const types = this.selection.types || [];
    const groupBy = this.groupBy || '';

    // if not categorical grouping: group by 1. entityIds, 2. types, 3. node.id (no grouping)
    if (!groupBy) {
      // group by id:
      if (ids.length) {
        if (ids.length > this.groupLimit) {
          return this.id;
        }
        return ids.join('-');
      }
      if (types.length) {
        if (types.length > this.groupLimit) {
          return this.id;
        }
        return types.join('-');
      }
      return this.id;
    }

    if (
      this.metadata.foundCategories[groupBy] &&
      this.metadata.foundCategories[groupBy] > this.groupLimit
    ) {
      // the number of different categories found is greater than groupLimit
      return this.id;
    }
    const categoryValue = this.getCategoricalPropertyValue(atomic, groupBy);
    return categoryValue ? `${this.id}-${categoryValue}` : this.id;
  }
  generateAtomicId(entityId: string): string {
    return `${this.id}-${entityId}`;
  }
  getNumericPropertyValues(entity: Entity) {
    const propertyValues = [];
    for (const key of this.selection.numericPropertyKeys || []) {
      const val = entity.properties[key]?.value || null;
      propertyValues.push(typeof val === 'number' ? val : null);
    }
    return propertyValues;
  }
  getConnectionId(atomic, relationshipKey?: string) {
    if (
      relationshipKey &&
      this.selection.internalRelationshipKeys.find(
        key => key === relationshipKey
      )
    ) {
      return atomic.internalRelationshipObjects[
        this.selection.internalRelationshipKeys.indexOf(relationshipKey)
      ];
    }
    if (
      relationshipKey &&
      this.selection.externalRelationshipKeys.find(
        key => key === relationshipKey
      )
    ) {
      return atomic.externalRelationshipObjects[
        this.selection.externalRelationshipKeys.indexOf(relationshipKey)
      ];
    }
    return atomic.entityId;
  }
  getAtomicNode(entityId: string) {
    return this.atomicNodes.get(entityId);
  }
  getNumericPropertyIndex() {
    const numericPropertyKeys = this.selection.numericPropertyKeys || [];
    const numericPropertyIndex = numericPropertyKeys.indexOf(
      this.selectedPropertyKey
    );
    return numericPropertyIndex;
  }
  getNumericPropertyValue(atomic: AtomicNode) {
    const numericPropertyIndex = this.getNumericPropertyIndex();
    const numericPropertyValue =
      atomic.numericPropertyValues[numericPropertyIndex];
    return numericPropertyValue;
  }
  getCategoricalPropertyValues(entity: Entity) {
    const propertyValues = [];
    for (const key of this.selection.categoricalPropertyKeys || []) {
      const val = entity.properties[key]?.value || '';
      // this enables using numeric values as categories
      propertyValues.push(`${val}`);
    }
    return propertyValues;
  }
  getCategoricalPropertyValue(atomic: AtomicNode, categoricalKey: string) {
    const categoricalPropertyKeys =
      this.selection.categoricalPropertyKeys || [];
    const categoricalIndex = categoricalPropertyKeys.indexOf(categoricalKey);
    const categoricalPropertyValue =
      atomic.categoricalPropertyValues[categoricalIndex];
    return categoricalPropertyValue;
  }
  getInternalRelationshipObjects(entity: Entity) {
    const objectIds = [];
    for (const key of this.selection.internalRelationshipKeys || []) {
      const val = entity.relationships[key]?.object || '';
      objectIds.push(`${val}`);
    }
    return objectIds;
  }
  getExternalRelationshipObjects(entity: Entity) {
    const objectIds = [];
    for (const key of this.selection.externalRelationshipKeys || []) {
      const val = entity.relationships[key]?.object || '';
      objectIds.push(`${val}`);
    }
    return objectIds;
  }
  async fetchEntities() {
    // generate query
    // fix getting from db
    const entities = await fetch('url');
    this.addEntities(await entities.json());
  }
  addEntities(entities: Entity[]) {
    this.metadata.numEntities =
      (this.metadata.numEntities || 0) + entities.length;
    for (const entity of entities) {
      this.metadata.foundTypes[entity.type] =
        (this.metadata.foundTypes[entity.type] || 0) + 1;
      this.addToTimeSpan(new Date(entity.observedAt));
      for (const propertyKey of Object.keys(entity.properties)) {
        const propertyValue = entity.getPropertyValue(propertyKey);
        if (typeof propertyValue !== 'number') {
          // used to suggest categorical grouping in node.groupBy
          this.metadata.foundCategories[propertyKey] =
            (this.metadata.foundCategories[propertyKey] || 0) + 1;
        } else {
          // used for analysing property values to suggest switching between selected property + validation
          this.metadata.foundNumericProperties[propertyKey] = this.metadata
            .foundNumericProperties[propertyKey] || {
            min: Infinity,
            max: -Infinity,
            sum: 0,
            count: 0,
          };
          const stats = this.metadata.foundNumericProperties[propertyKey];
          if (propertyValue < stats.min) {
            stats.min = propertyValue;
          }
          if (propertyValue > stats.max) {
            stats.max = propertyValue;
          }
          stats.sum += propertyValue;
          stats.count += 1;
        }
      }
      for (const relationshipKey of Object.keys(entity.relationships)) {
        // used to suggest relationship connections to internal or to external
        // example: IFCBuilding entity is loaded -> adjust the node selection to include composes relationship to show the building property
        // example: IFCBeam have upstream connection -> create a new node right side to show the product entities
        this.metadata.foundRelationships[relationshipKey] =
          (this.metadata.foundRelationships[relationshipKey] || 0) + 1;
      }
      const composes = entities.filter(
        e => e.relationships.composes?.object === entity.id
      );
      if (composes.length > 0) {
        this.addEntities(composes);
      }
    }
    // create atomic nodes
    for (const entity of entities) {
      const atomicNode = {
        id: this.generateAtomicId(entity.id),
        entityId: entity.id,
        type: entity.type,
        numericPropertyValues: this.getNumericPropertyValues(entity),
        categoricalPropertyValues: this.getCategoricalPropertyValues(entity),
        internalRelationshipObjects:
          this.getInternalRelationshipObjects(entity),
        externalRelationshipObjects:
          this.getExternalRelationshipObjects(entity),
      } as AtomicNode;
      if (this.groupBy) {
        atomicNode.linkGroupId = this.getCategoricalPropertyValue(
          atomicNode,
          this.groupBy
        );
      }
      // if (entity.bounds) {
      //   atomicNode.bounds = entity.bounds;
      // }
      if (entity.modelMatrix) {
        atomicNode.modelMatrix = entity.modelMatrix;
      }
      this.atomicNodes.set(entity.id, atomicNode);
    }
  }
  addToTimeSpan(date: Date) {
    if (!this.metadata.startDate || date < this.metadata.startDate) {
      this.metadata.startDate = date;
    }
    if (!this.metadata.endDate || date > this.metadata.endDate) {
      this.metadata.endDate = date;
    }
  }
}

type LinkGroup = {
  id: string;
  sourceGroupKey: string;
  sourceGroupPropertyIndex: number; // the index of the selected property for quick value access in atomics
  sourceGroupName: string; // instead of the specific key this can be used (for example if the groups has same name for nodes on several places -> the id needs to be unique)
  sourceNodeId: string;
  targetGroupKey: string;
  targetGroupPropertyIndex: number; // the index of the selected property for quick value access in atomics
  targetGroupName: string;
  targetNodeId: string;
  value: number;
  count: number;
  sourceGroupAtomicNodes: AtomicNode[];
};

const HOURS = 5;
const DAYS = 4;
const WEEKS = 3;
const MONTHS = 2;
const YEARS = 1;
export type TimeResolution =
  | 0
  | typeof YEARS
  | typeof MONTHS
  | typeof WEEKS
  | typeof DAYS
  | typeof HOURS
  | 6
  | 7; // no time, years, months, weeks, days, hours, minutes, seconds

type ExplorationProperty = {
  propertyKey: string;
  label?: string;
  unit?: string;
};

// todo: for selection of relationship just like property above
type ExplorationRelationship = {
  relationshipKey: string;
  label?: string;
};

// Needed in both client and server to keep metadata and user experience plus generate the queries and process the entities
// 1. User adds a step into the exploration -> send to backend -> generate query -> get back entities
// 2. Server: process entities -> generate initial nodes -> generate spatial index for sankey and for timeline -> put entity some stuff in redis cache -> generate a response for update local exploration
// 3. Client: trigger a fetch on the current viewport to get the initial nodes
export class Exploration {
  entities: Entity[]; // only on server (put in redis maybe) or if loaded locally. Also -> consider skip saving the entities (only atomics) since query is done per exploration node
  // todo: keep the catalog of properties in root level, taken from indicators
  propertyCatalog: {
    [propertyKey: string]: ExplorationProperty;
  } = {
    // note: the 'count' in properties are first checked, if not exist each entity gets '1'
    count: {
      propertyKey: 'count',
      label: 'Count',
    },
    volume: {
      propertyKey: 'volume',
      label: 'Volume',
      unit: 'm3',
    },
    area: {
      propertyKey: 'area',
      label: 'Area',
      unit: 'm2',
    },
  };
  selectedProperty: ExplorationProperty; // only one property key can be selected at a time. Note that nodes have their own setting for this
  nodes: ExplorationNode[] = [];
  // linkGroups holds the link between the atomicNodes of the exploration nodes as well as the ref to atomics and the clusters
  linkGroups: Map<string, LinkGroup> = new Map();
  // takes all atomicNodes in linkGroups and cluster them -> query the cluster with viewport and zoom to get out the cluster nodes -> use the nodes to split existing nodes in viewport
  cluster?: KDBush[]; // cluster by index from maxZoom + 1 (all atomicNodes) to minZoom (max clustered)
  // set these from the nodes, not directly
  public startDate?: Date; // if missing in entity import, use the min observedAt in entities
  public endDate?: Date; // if missing in entity import, use the max observedAt OR a reasonable min range
  public timeResolution: TimeResolution = 0; // this needs to be regenerated after each step is loaded
  public minZoom = 0;
  public maxZoom = 16;
  public clusterRadius = 25;
  private minPoints = 2;
  getNode(nodeId: string): ExplorationNode | undefined {
    for (const node of this.nodes) {
      return this.findNode(nodeId, node);
    }
  }
  findNode(nodeId, node) {
    if (node.id === nodeId) {
      return node;
    } else if (node.node) {
      return this.findNode(nodeId, node.node);
    }
  }
  getAtomicsFromLinkGroup(nodeKey: string): AtomicNode[] {
    // ! note: if sourceGroupKey and targetGroupKey is the same, the nodes will be duplicated - consider a map
    const foundNodes = [];
    for (const linkGroup of this.linkGroups.values()) {
      if (linkGroup.sourceGroupKey === nodeKey) {
        foundNodes.push(...linkGroup.sourceGroupAtomicNodes);
      }
      if (linkGroup.targetGroupKey === nodeKey) {
        foundNodes.push(...linkGroup.sourceGroupAtomicNodes);
      }
    }
    return foundNodes;
  }
  // this returns a set of options for the user to explore this node further, ex create another node upstream or downstream based on properties or relations
  getNodeOptions(nodeId: string): EntityMetadata {
    const node = this.getNode(nodeId);
    if (!node) {
      return {
        foundTypes: {},
        foundCategories: {},
        numEntities: 0,
        startDate: new Date(),
        endDate: new Date(),
        foundRelationships: {},
        foundNumericProperties: {},
      };
    }
    return node.metadata;
  }
  // this returns a set of options for the user to explore this link further, ex group the link by categorical property
  // getLinkOptions(linkId: string): EntityMetadata {
  //   const link = this.getLink(linkId);
  //   if (!link) {
  //     return {
  //       foundTypes: {},
  //       foundCategories: {},
  //       numEntities: 0,
  //       startDate: new Date(),
  //       endDate: new Date(),
  //       foundRelationships: {},
  //       foundNumericProperties: {},
  //     };
  //   }
  //   return link.targetNode.metadata;
  // }
  setSelectedProperty(propertyKey: string) {
    // this is so that user can change selected property without loosing the previously loaded atomics
    this.selectedProperty = this.propertyCatalog[propertyKey];
  }

  // use the node separately to load the entities from its settings, then add the node and resulting entities to exploration
  addNode(node: ExplorationNode, entities: Entity[], parent?: ExplorationNode) {
    if (!node.selectedPropertyKey) {
      node.selectedPropertyKey = this.selectedProperty.propertyKey;
    }
    node.addEntities(entities);
    if (parent) {
      parent.addNode(node);
    } else {
      // root nodes
      this.nodes.push(node);
    }
    // todo: should this be done automatically?
    this.generateLinks();
  }
  addToTimeSpan(date: Date) {
    if (!this.startDate || date < this.startDate) {
      this.startDate = date;
    }
    if (!this.endDate || date > this.endDate) {
      this.endDate = date;
    }
  }
  setTimeResolution(resolution?: TimeResolution) {
    if (!this.endDate || !this.startDate) {
      return 0;
    }
    let setResolution = resolution;
    const dayDiff = Math.floor(
      (this.endDate.getTime() - this.startDate.getTime()) /
        (1000 * 60 * 60 * 24)
    );
    if (!resolution) {
      // use hours as the min for now
      setResolution =
        dayDiff < 7 // Max 7 * 24 bars
          ? HOURS
          : dayDiff < 365 // Max 365 bars
          ? DAYS
          : dayDiff < 1000 // Max 1000 / 7 bars
          ? WEEKS
          : dayDiff < 365 * 10 // Max 3650 / 12 bars
          ? MONTHS
          : YEARS;
    }

    this.timeResolution = setResolution;
  }
  // link groups are generated on the fly, since links are combination of parent and child, and can be generated across different nodes (using the keys)
  generateLinkGroups(
    parent: ExplorationNode,
    links,
    depth,
    timeIndex = -1,
    boundingBox?,
    zoom?
  ) {
    if (parent.child) {
      for (const parentAtomicNode of parent.atomicNodes.values()) {
        const childAtomicNode = parent.child.getAtomicNode(
          parent.getConnectionId(parentAtomicNode)
        );
        if (!childAtomicNode) {
          continue;
        }

        // todo: how to do with depth? try to have duplication of types that should not be grouped
        const sourceGroupKey = parent.generateNodeGroupId(parentAtomicNode);
        const targetGroupKey =
          parent.child.generateNodeGroupId(childAtomicNode);
        // todo: maybe set the depth on sourceGroupKey/targetGroupKey instead of the linkGroupKey?
        const linkGroupKey = `${depth}-${sourceGroupKey}-${targetGroupKey}`;

        // todo: if the linkGroup is already clustered and is called with boundingbox and zoom, the linkGroup should be split here if boundingBox is a match
        // if boundingBox is relevant and if zoom !== 0
        // and if cluster exist on linkGroup
        // call the cluster on boundingBox and zoom to see if clusterNodes come back
        // if so, split the sourceGroupKey above to the cluster sub groups
        // another linkGroup will be created now here and the code below is fall through if no clustering should be done

        if (!links.has(linkGroupKey)) {
          links.set(linkGroupKey, {
            id: linkGroupKey,
            sourceGroupName: parent.getCategoricalPropertyValue(
              parentAtomicNode,
              parent.groupBy
            ),
            sourceGroupKey,
            sourceGroupPropertyIndex: parent.getNumericPropertyIndex(),
            sourceNodeId: parent.id,
            targetGroupName: parent.child.getCategoricalPropertyValue(
              childAtomicNode,
              parent.child.groupBy
            ),
            targetGroupKey,
            targetGroupPropertyIndex: parent.child.getNumericPropertyIndex(),
            targetNodeId: parent.child.id,
            depth,
            value: 0,
            count: 0,
            // lets try to save the relevant atomic nodes on the link group and do the cluster AFTER all links have been created
            // the source group key is used for generating the unique sankey nodes when all links are put together -> so all the atomics to sort should be here:
            sourceGroupAtomicNodes: [],
          } as LinkGroup);
        }
        const linkGroup = links.get(linkGroupKey);

        let value = parent.getNumericPropertyValue(parentAtomicNode);
        // this is the special modifier to support the number of entities as quantity
        if (
          this.selectedProperty.propertyKey === 'count' &&
          !value &&
          value !== 0
        ) {
          value = 1;
        }
        if (value || value === 0) {
          linkGroup.value += value;
          linkGroup.count += 1;
        }
        // each link group has the source atomics cached, for clustering later
        linkGroup.sourceGroupAtomicNodes.push(parentAtomicNode);
      }
    }

    if (parent.child && parent.child.child) {
      this.generateLinkGroups(
        parent.child,
        links,
        depth + 1,
        timeIndex,
        boundingBox,
        zoom
      );
    }
  }
  // this method is used to generate the link groups for all exploration nodes
  // ! note: it should be possible to call generateLinkGroups directly for a certain node for partial exploration updates
  generateLinks(
    nodes: ExplorationNode[] = this.nodes,
    timeIndex?: number,
    boundingBox?: [number, number, number, number],
    zoom?: number
  ): void {
    const links: Map<string, LinkGroup> = new Map();
    const depth = 0;
    for (const node of nodes) {
      this.generateLinkGroups(node, links, depth, timeIndex, boundingBox, zoom);
    }
    this.linkGroups = links;
  }
  getTimeStep(date: Date) {
    const diff = date.getTime() - this.startDate.getTime();
    // start with hours
    let step = diff / 1000 / 60 / 60;
    if (this.timeResolution < HOURS) {
      // days
      step /= 24;
    }
    if (this.timeResolution === WEEKS) {
      return Math.floor(step / 7);
    }
    if (this.timeResolution === MONTHS) {
      return Math.floor(step / 30.4);
    }
    if (this.timeResolution === YEARS) {
      return Math.floor(step / 365);
    }
    return Math.floor(step);
  }
  // sankey is always generated on zoom level zero for the overall sankey layout
  // when zooming in, the splitting of paths in the sankey must be calculated separately (because regenerating the sankey would flip around the chart confusing the user)
  // so:
  // 1. entities are queried for each exploration node (some node will take the same entities input <- do not query more than once)
  // 2. the sankey input can be generated here, the sankey layout is being created in the sankey module from this input
  // 3. the sankey layout must be sent into the cluster generator together with the exploration nodes -> this will group the atomic nodes by their parent exploration nodes (the id connects the exploration nodes to the sankey nodes)
  // 4. the cluster nodes must use the exploration node ids and the children entities for each zoom level -> now each atomic node are cluster if they are close to each other (in columns)
  // 5. the viewport must query the cluster initially on zoom zero and find a way to split the paths on the sankey to match the nodes coming back
  getSankeyInput() {
    const linksGroups = Array.from(this.linkGroups.values());
    const links = linksGroups.reduce((acc, link) => {
      if (link.value) {
        acc.push({
          id: link.id,
          unit: this.selectedProperty.unit,
          source: link.sourceGroupKey,
          target: link.targetGroupKey,
          value: link.value,
        } as SankeyLink);
      }
      return acc;
    }, []);
    const nodeMap = linksGroups.reduce((acc, link) => {
      if (link.value) {
        if (!acc[link.sourceGroupKey]) {
          acc[link.sourceGroupKey] = {
            id: link.sourceGroupKey,
            unit: this.selectedProperty.unit,
            name: link.sourceGroupName,
            explorationNodeId: link.sourceNodeId,
            numericPropertyIndex: link.sourceGroupPropertyIndex,
            count: 0,
          } as SankeyNode;
        }
        acc[link.sourceGroupKey].count += link.count;

        if (!acc[link.targetGroupKey]) {
          acc[link.targetGroupKey] = {
            id: link.targetGroupKey,
            unit: this.selectedProperty.unit,
            name: link.targetGroupName,
            explorationNodeId: link.targetNodeId,
            numericPropertyIndex: link.targetGroupPropertyIndex,
            count: 0, // this will be the sourceGroup next iteration
          } as SankeyNode;
        }
      }
      return acc;
    }, {});
    return {
      nodes: Object.values(nodeMap),
      links,
    };
  }

  // still a questionmark if this should be done here
  getSankeyOutput(sankeyInput?) {
    const { nodes, links } = sankeyInput || this.getSankeyInput();
    const sankey = circularSankey();
    return sankey(nodes, links);
  }

  // todo: this only supports 'vertical' for now, create 'horizontal' etc
  layoutAtomicNodes(atomicNodes: AtomicNode[], nodeClusterSetting) {
    // coordinates in cartesian space! (since it needs to query by visible bounds, not pixels)
    const { x0, y0, y1, value, numericPropertyIndex } = nodeClusterSetting;
    if (!y1) {
      console.warn('Layout node must have a size', nodeClusterSetting);
      return;
    }
    const numAtomics = atomicNodes.length;
    const nodeHeight = y1 - y0;
    const useFraction =
      (numericPropertyIndex || numericPropertyIndex === 0) &&
      numericPropertyIndex !== -1;
    // ! this is because the height needs to be different depending on value
    // use this for atomic values
    const fraction = nodeHeight / value;
    // use this for atomic count
    const equal = nodeHeight / numAtomics;
    // for fraction, the atomics need to be sorted desc
    if (useFraction) {
      atomicNodes.sort(
        (a, b) =>
          b.numericPropertyValues[numericPropertyIndex] -
          a.numericPropertyValues[numericPropertyIndex]
      );
    }
    for (let i = 0; i < atomicNodes.length; i++) {
      const atomic = atomicNodes[i];
      const atomicHeight = useFraction
        ? atomic.numericPropertyValues[numericPropertyIndex] * fraction
        : equal;
      atomic.x = x0;
      // note that margin is calculated when the nodes are splitted according to cluster result
      atomic.y = y0 + atomicHeight * (i + 1);
    }
    return atomicNodes;
  }

  createClusterFromSankey(sankeyNodes: SankeyNode[]) {
    const clusterSettings: NodeClusterSetting[] = sankeyNodes.map(node => ({
      id: node.id,
      layout: 'vertical',
      value: node.value,
      x0: node.x0,
      x1: node.x1,
      y0: node.y0,
      y1: node.y1,
    }));
    return this.createCluster(clusterSettings);
  }

  // When linkGroups have been created, and after they have been used for initial layout, send it here to cluster the atomics that are cached on each link group
  createCluster(nodeClusterSettings: NodeClusterSetting[]) {
    const linkGroups = Array.from(this.linkGroups.values());
    const atomicNodesWithLayout = [];
    for (const nodeClusterSetting of nodeClusterSettings) {
      console.log(nodeClusterSetting);
      const atomics = linkGroups.reduce((acc, linkGroup) => {
        console.log(linkGroup);
        if (nodeClusterSetting.id === linkGroup.sourceGroupKey) {
          acc.push(...linkGroup.sourceGroupAtomicNodes);
        }
        // if (nodeClusterSetting.id === linkGroup.targetGroupKey) {
        //   const soureLinkGroup = linkGroups.find(
        //     g =>
        //       g.sourceGroupKey === linkGroup.sourceGroupKey &&
        //       g.targetGroupKey === nodeClusterSetting.id
        //   );
        //   if (soureLinkGroup) {
        //     acc.push(...soureLinkGroup.sourceGroupAtomicNodes);
        //   }
        // }
        return acc;
      }, []);
      // set x, y on atomic by reference
      console.log(atomics);
      this.layoutAtomicNodes(atomics, nodeClusterSetting);
      atomicNodesWithLayout.push(...atomics);
    }

    // for each zoom create a cluster
    let clusterNodes = [];
    for (const atomic of atomicNodesWithLayout) {
      clusterNodes.push({
        id: atomic.id,
        x: Math.fround(atomic.x),
        y: Math.fround(atomic.y),
        zoom: Infinity,
        parentId: -1,
      });
    }
    // no cluster level
    const cluster = new Array(this.maxZoom + 1);
    cluster[this.maxZoom + 1] = new KDBush(
      clusterNodes,
      p => p.x,
      p => p.y
    );
    for (let z = this.maxZoom; z >= this.minZoom; z--) {
      clusterNodes = this.createClusterForZoomLevel(
        clusterNodes,
        z,
        cluster,
        atomicNodesWithLayout.length
      );
      cluster[z] = new KDBush(
        clusterNodes,
        p => p.x,
        p => p.y
      );
    }
    this.cluster = cluster;
    return cluster;
  }

  createClusterForZoomLevel(
    clusterNodes,
    zoom,
    clusterWrapper,
    numAtomicsTotal: number
  ) {
    // note: instances are used for iterating each zoom level
    const clusteredClusterNodes = [];
    const radius = this.clusterRadius / 2 ** zoom; // this.extent * scale
    for (let i = 0; i < clusterNodes.length; i++) {
      const clusterNode = clusterNodes[i];
      if (clusterNode.zoom <= zoom) {
        continue;
      }
      clusterNode.zoom = zoom;
      const tree = clusterWrapper[zoom + 1];
      // get all point ids within radius
      const neighborIds = tree.within(clusterNode.x, clusterNode.y, radius);

      const numPointsInitially = clusterNode.numPoints || 1;
      let pointCount = numPointsInitially;

      for (const neighborId of neighborIds) {
        const point = tree.points[neighborId];
        if (point.zoom > zoom) {
          pointCount += point.numPoints || 1;
        }
      }

      // use to calculate statistics on cluster
      const clusterPoints = [clusterNode];

      // note that neighbors can be part of another cluster, so they should be skipped if the zoom is same (or smaller)

      // do we have a cluster?
      if (pointCount >= this.minPoints) {
        // let wx = clusterNode.x;
        // let wy = clusterNode.y;
        let wx = clusterNode.x * numPointsInitially;
        let wy = clusterNode.y * numPointsInitially;

        // encode both zoom and point index on which the cluster originated -- offset by total length of features
        const id = (i << 5) + (zoom + 1) + numAtomicsTotal;

        // let nameParts = cluster.name.split('--');
        // const nameStart = nameParts.length > 1 ? nameParts[0] : cluster.name;
        // let nameEnd = 'end';

        for (const neighborId of neighborIds) {
          const point = tree.points[neighborId];
          if (point.zoom <= zoom) {
            continue;
          }
          // nameParts = point.name.split('--');
          // if (!nameStart) {
          //   nameStart = nameParts.length > 1 ? nameParts[0] : name;
          // }
          // nameEnd = nameParts.length > 1 ? nameParts[1] : point.name;

          point.zoom = zoom; // save the zoom (so it doesn't get processed twice)

          const numPoints = point.numPoints || 1;
          // wx += point.x;
          // wy += point.y;
          wx += point.x * numPoints; // accumulate coordinates for calculating weighted center
          wy += point.y * numPoints;

          point.parentId = id;

          clusterPoints.push(point);
        }

        // a hack if nameEnd was not part of neighbor aggregation, the nameEnd is on the parent
        // if (nameEnd === 'end') {
        //   nameParts = cluster.name.split('--');
        //   nameEnd = nameParts.length > 1 ? nameParts[1] : 'end';
        // }

        clusterNode.parentId = id;
        clusteredClusterNodes.push({
          x: Math.fround(wx / pointCount),
          y: Math.fround(wy / pointCount),
          id,
          zoom: Infinity,
          //name: `${nameStart}--${nameEnd}`, //nameStart === nameEnd ? `Num: ${pointCount}` : `${nameStart}--${nameEnd}`,
          numPoints: pointCount,
        });
      } else {
        // leave points as unclustered
        clusteredClusterNodes.push(clusterNode);
        // include any neighbors not already added
        if (pointCount > 1) {
          for (const neighborId of neighborIds) {
            const point = tree.points[neighborId];
            if (point.zoom <= zoom) {
              continue;
            }
            point.zoom = zoom;
            clusteredClusterNodes.push(point);
          }
        }
      }
    }

    return clusteredClusterNodes;
  }

  // minX, minY, maxX, maxY
  getClusters(bbox: [number, number, number, number], zoom = 0) {
    const clusters = [];
    const limitedZoom = Math.max(
      this.minZoom,
      Math.min(Math.ceil(zoom), this.maxZoom + 1)
    );
    const clusterNode = this.cluster[limitedZoom];
    const ids = clusterNode.range(...bbox);
    for (const id of ids) {
      const c = clusterNode.points[id];
      c.zoom = zoom;
      // c._connections = this.generateConnections(c, zoom);
      // const entity = this.clusterToEntity(c);
      clusters.push(c);
    }
    return clusters;
  }
}
