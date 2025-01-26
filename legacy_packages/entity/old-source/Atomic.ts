import { Entity } from './Entity.js';

export class Atomic {
  constructor(
    public sourceId: number,
    public targetId: number,
    public sourceEntityId: string,
    // if target entity id is null, it will be added later in the atomic generation
    public targetEntityId: string | null,
    public propertyKey: string,
    // the link relationship can be internal, using the groupIndex
    public relationshipKey: string | null,
    public value: number,
    public sourceGroupId: number,
    // if target group id is null, this is because it will be added from a coming group
    public targetGroupId: number | null,
    public timeIndex: number
  ) {}
}
