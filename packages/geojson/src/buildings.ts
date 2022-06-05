import { Feature } from 'geojson';

// given geojson features, decide what is a building (and related) from the properties
export function buildingsFromPolygons(features: Feature[]) {
  const buildings = features.filter(
    f => f.properties.building && f.properties.building !== 'no'
  );
  return buildings;
}

// json-ld context is used for the properties
// properties.type is @type
// id is @id and should have a specific URN/IRI
// note that the GeoJSON itself should be contextualized against https://geojson.org/geojson-ld/geojson-context.jsonld
export function validateBuildingProperties(
  buildingFeatures: Feature[],
  context,
  schemas
) {
  // 1. all properties must exist in context, or context must be expanded until everything is explicitly descripbed
  // 2. a JTD schema is used to validate further the values on the contextual properties -> the @types must be found in schemas
}
