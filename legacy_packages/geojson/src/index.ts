import { Feature, FeatureCollection } from 'geojson';
import { coordinatesToMeters } from './project.js';
import {
  buildingsFromPolygons,
  validateBuildingProperties,
} from './buildings.js';
import { toEntities } from './entities.js';
import { toGltf, ToGltfInput } from './to-3d-tiles.js';
import { getModelMatrix, getBounds, getLayerPosition } from './bounds.js';
import { convert } from './convert.js';
import { forEachCoordinate } from './foreach.js';
import { copyProperties, addProperty } from './properties.js';

export {
  Feature,
  FeatureCollection,
  convert,
  forEachCoordinate,
  buildingsFromPolygons,
  validateBuildingProperties,
  getLayerPosition,
  getModelMatrix,
  getBounds,
  coordinatesToMeters,
  toEntities,
  toGltf,
  ToGltfInput,
  copyProperties,
  addProperty,
};
