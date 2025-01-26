import { Entity } from './Entity.js';
import { Atomic } from './Atomic.js';

// todo: for each step, group by entityIds if exist in group links by groupIndex if exist, otherwise group by type or datasetId?
// ok, figure out how to group without using the exploration, can groupId be used? start with atomic id 0
// look at createCluster grouping, it should be similar

export class AtomicIndex {
  createIndex(atomics: Atomic[], entities: Entity[]) {}
}
