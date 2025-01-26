import { Entity } from './Entity.js';

// a bucket is a node in the exploration graph that filters the base entities
export class Bucket {
  branchId: string;
  types: string[]; // the types that should be filtered from the parent
  entityIds: string[]; // the entityIds that should be filtered from the parent
  pagination: string;
  // entities are stored in Base (loaded stream)
  cache: {
    [entityId: string]: Entity; // ref to entity in Base
  };
}
