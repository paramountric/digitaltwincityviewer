import {
  FeatureCollection,
  Feature,
  Point,
  MultiPoint,
  LineString,
  MultiLineString,
  Polygon,
  MultiPolygon,
  Geometry,
} from 'geojson';

// context:
//"ngsi-ld": "https://uri.etsi.org/ngsi-ld/",
//"geojson": "https://purl.org/geojson/vocab#",

// todo: property typing somewhere else according to ngsi-ld

type EntityFeature = {
  id: string; // this is the feature id, consider to have a relationship to the entity (this is because several features might be imported for one entity). Also the original id is kept in properties
  type: 'Feature';
  geometry: GeoPropertyValue;
  properties: Properties;
  relationships?: Relationships;
};

type GeoPropertyValue = {
  type: string; // todo: add the geojson geometry types
  coordinates:
    | Point
    | MultiPoint
    | LineString
    | MultiLineString
    | Polygon
    | MultiPolygon;
};

type PropertyValue = {
  type: 'Property' | 'GeoProperty';
  value: string | number | boolean | GeoPropertyValue; // more options exist in the spec
  unitCode?: string;
  datasourceId?: string;
  observedAt?: string;
};

type Properties = {
  [propertyKey: string]: PropertyValue | RelationshipValue | string;
};

type RelationshipValue = {
  type: 'Relationship';
  object: string;
  datasourceId?: string;
  observedAt?: string;
};

type Relationships = {
  [propertyKey: string]: RelationshipValue;
};

// note: the geometry should according to the spec be included as a GeoProperty
// but for now this is avoided to reduce data size -> the point of the properties is in this case for pure linked data
// (the geometry is for now only kept in root of the EntityFeature)
// however, a good next step could be to look into some universal way of defining geo properties in linked data, like some location (center)
function getProperties(feature: Feature, datasetId?) {
  const type = guessType(feature.properties);
  const properties: Properties = {
    type,
  };
  for (const propertyKey of Object.keys(feature.properties)) {
    properties[propertyKey] = {
      type: 'Property',
      value: feature.properties[propertyKey],
    };
  }
  if (feature.id) {
    properties.featureId = {
      type: 'Property',
      value: feature.id,
    };
  }
  if (datasetId) {
    // this is not used according to spec here. It should really be used when there are multiple values for a propertyKey
    // however, for now this is saved as a tracing reference, and also useful later should it be needed as proper datasetId
    properties.datasetId = {
      type: 'Property',
      value: datasetId,
    };
  }
  return properties;
}

function guessType(properties) {
  // todo: some kind of datasource hint is needed, this is only for OSM
  if (properties.building && properties.building !== 'no') {
    return 'Building';
  }
  // this should ideally be clarified by user
  return 'GenericFeature';
}

export function toEntities(geojson: FeatureCollection, datasetId?: string) {
  const entites: EntityFeature[] = [];
  for (const feature of geojson.features) {
    const properties = getProperties(feature, datasetId);
    // const geometry = feature.geometry as Geometry; // why does as Geometry give error "does not have coordinates"? skip type checking for now
    const geometry = feature.geometry as any;
    const id = feature.id || feature.properties.id || `${Date.now()}`;
    entites.push({
      id: `${properties.type}:${id}`,
      type: 'Feature',
      geometry: {
        type: feature.geometry.type,
        coordinates: geometry.coordinates,
      },
      properties,
    });
  }
}
