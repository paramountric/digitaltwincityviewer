import {
  FeatureCollection,
  Feature,
  Position,
  Polygon,
  MultiPolygon,
} from 'geojson';
import { vec3, mat4 } from 'gl-matrix';

function getMultiPolygonBounds(multiPolygon: Position[][][], min, max) {
  for (const polygon of multiPolygon) {
    getPolygonBounds(polygon, min, max);
  }
}

function getPolygonBounds(polygon: Position[][], min, max) {
  const multiPolygon =
    Array.isArray(polygon[0]) && Number.isFinite(polygon[0][0])
      ? [polygon]
      : polygon;
  for (const poly of multiPolygon) {
    for (const point of poly) {
      if (point[0] < min[0]) {
        min[0] = point[0];
      }
      if (point[1] < min[1]) {
        min[1] = point[1];
      }
      if (point[0] > max[0]) {
        max[0] = point[0];
      }
      if (point[1] > max[1]) {
        max[1] = point[1];
      }
    }
  }
}

export function getBounds(features: Feature[]) {
  const min = [Infinity, Infinity, 0];
  const max = [-Infinity, -Infinity, 0];
  for (const feature of features) {
    // todo: add more types
    if (feature.geometry.type === 'Polygon') {
      getPolygonBounds(feature.geometry.coordinates, min, max);
    } else if (feature.geometry.type === 'MultiPolygon') {
      getMultiPolygonBounds(feature.geometry.coordinates, min, max);
    }
  }
  return {
    min,
    max,
  };
}

// Set bounds on the feature collection according to spec
export function setBounds(featureCollection: FeatureCollection, force = false) {
  if (featureCollection.bbox && !force) {
    return featureCollection;
  }
  const { min, max } = getBounds(featureCollection.features);
  featureCollection.bbox = [min[0], min[1], max[0], max[1]];
}

// todo: deprecate this function since the center/bounds needs to be preserved (or sent in to the function)
export function getModelMatrix(features: Feature[]) {
  const { min, max } = getBounds(features);
  const size = vec3.sub(vec3.create(), max as vec3, min as vec3);
  const offset = vec3.add(
    vec3.create(),
    min as vec3,
    vec3.scale(vec3.create(), size, 0.5)
  );
  const position = vec3.negate(vec3.create(), offset);
  const modelMatrix = mat4.fromTranslation(mat4.create(), position);
  return modelMatrix;
}

// todo: this is a function needed for each module (different kind of data)
// -> create type or maybe even put it in a central module (but to not over-dry!)
export function getLayerPosition(features: Feature[]) {
  const { min, max } = getBounds(features);
  const size = vec3.sub(vec3.create(), max as vec3, min as vec3);
  const offset = vec3.add(
    vec3.create(),
    min as vec3,
    vec3.scale(vec3.create(), size, 0.5)
  );
  const position = vec3.negate(vec3.create(), offset);
  const modelMatrix = mat4.fromTranslation(mat4.create(), position);
  return {
    min,
    max,
    width: size[0],
    height: size[1],
    center: [...offset],
    modelMatrix,
  };
}
