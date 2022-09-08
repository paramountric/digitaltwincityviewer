import { Feature, FeatureCollection } from 'geojson';
import { coordinatesToMeters, coordinatesToMeterOffsets } from './project.js';
import {
  buildingsFromPolygons,
  validateBuildingProperties,
} from './buildings.js';
import { toEntities } from './entities.js';
import { toGltf, ToGltfInput } from './to-3d-tiles.js';
import { getModelMatrix, getBounds, getLayerPosition } from './bounds.js';
import { convert } from './convert';

export {
  Feature,
  FeatureCollection,
  convert,
  buildingsFromPolygons,
  validateBuildingProperties,
  getLayerPosition,
  getModelMatrix,
  getBounds,
  coordinatesToMeters,
  coordinatesToMeterOffsets,
  toEntities,
  toGltf,
  ToGltfInput,
};
