// todo: refactor
export type EntityProperty = {
  type: 'Property' | 'GeoProperty' | '';
  value: string | number;
  unitCode?: string;
  // consider to use 'nominal', 'ordinal', 'interval' and 'ratio' to know how the value can be used
};
export type EntityProperties = {
  [propertyKey: string]: EntityProperty;
};
export type EntityRelationship = {
  type: 'Relationship';
  object: string;
  properties?: EntityProperties;
};
export type EntityRelationships = {
  [relationshipKey: string]: EntityRelationship;
};

type EntityProps = {
  id: string;
  type: string;
  observedAt: string | null;
  properties: EntityProperties;
  relationships: EntityRelationships;
  modelMatrix?: number[]; // 4x4
  bounds?: [number, number, number, number, number, number]; // minx, miny, minz, maxx, maxy, maxz
};
export class Entity {
  id: string;
  type: string;
  observedAt: string; // iso date string
  createdAt?: string; // for db
  updatedAt?: string; // for db
  properties: EntityProperties;
  relationships: EntityRelationships;
  // not sure about these, but for spatial queries it could be good to have them in root
  // bounds is untransformed boundingBox representation
  bounds?: [number, number, number, number, number, number]; // minx, miny, minz, maxx, maxy, maxz
  modelMatrix?: number[]; // this together with Box can display the entity
  constructor({
    id,
    type,
    observedAt = null,
    properties = {},
    relationships = {},
    modelMatrix,
    bounds,
  }: EntityProps) {
    this.id = id;
    this.type = type;
    this.observedAt = observedAt || new Date().toISOString();
    this.properties = properties;
    this.relationships = relationships;
    if (modelMatrix) {
      this.modelMatrix = modelMatrix as number[];
    }
    if (bounds) {
      this.bounds = bounds as [number, number, number, number, number, number];
    }
  }
  getPropertyValue(propertyKey: string) {
    return this.properties[propertyKey]?.value;
  }
  getRelationshipObject(relationshipKey: string) {
    return this.relationships[relationshipKey]?.object;
  }
  getRelationshipValue(relationshipKey: string, propertyKey: string) {
    const relationshipProperties =
      this.relationships[relationshipKey]?.properties;
    if (!relationshipProperties) {
      return undefined;
    }
    return relationshipProperties[propertyKey]?.value;
  }
  hasRelationship(relationshipKey: string): boolean {
    return Boolean(this.relationships[relationshipKey]);
  }
  getNumericValue(propertyKey, relationshipKey): number | null {
    const relationshipValue = this.getRelationshipValue(
      relationshipKey,
      propertyKey
    );
    if (typeof relationshipValue === 'number') {
      return relationshipValue;
    }
    const propertyValue = this.getPropertyValue(propertyKey);
    if (typeof propertyValue === 'number') {
      return propertyValue;
    }
    return null;
  }
}
