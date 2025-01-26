// Exploration graph is a selection of bases and their entities to use for the graph
// export class Exploration {
//   entities: Map<string, Entity> = new Map();
//   bases: Base[] = [];
//   buckets: Bucket[] = [];
//   types: Map<string, EntityType> = new Map();

//   // load nodes dynamically
// }

type BaseNode = {
  // this is where the data is stored longterm
  streamId: string;
};

type BucketNode = {
  // this is what the user selected to generate this node
  // note that this will be converted to cypher or graphql and the result should genrate new query suggestions dynamically
  // all the types of children needs to be returned, and pagination must be supported
  // two options: generate bucket (create a new query from the analysis of children = create a search!)
  // and exploration nodes (finding entites, properties, etc = just exploring)
  types: string[];
  entityIds: string[];
  pagination: number; // by default the first 10 (or something) entities are shown
  // the selection is filtered from this node (base or bucket node)
  parentId: string;
};

export type ExplorationEdge = {
  source: string;
  target: string;
  id: string;
  name: string;
};

export type ExplorationNode = {
  id: string;
  name: string;
  streamId?: string;
  types?: string[];
  entityIds?: string[];
  pagination?: number; // by default the first 10 (or something) entities are shown
  // the selection is filtered from this node (base or bucket node)
  parentId?: string;
  x?: number;
  y?: number;
  fx?: number;
  fy?: number;
  radius?: number;
};

class Exploration {
  nodes: ExplorationNode[];
  edges: ExplorationEdge[];
}

export { Exploration };
