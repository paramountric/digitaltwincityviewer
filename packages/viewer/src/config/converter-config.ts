// This code is derived from deck.gl under MIT license:
// https://github.com/visgl/deck.gl/tree/master/examples/playground/src

import { COORDINATE_SYSTEM, MapView } from '@deck.gl/core';
import type { LayerProps } from '@deck.gl/core';
import type { ViewProps } from '@deck.gl/core';
import {
  ScatterplotLayer,
  LineLayer,
  GeoJsonLayer,
  SolidPolygonLayer,
} from '@deck.gl/layers';
import GL from '@luma.gl/constants';
import { QuadkeyLayer, MVTLayer } from '@deck.gl/geo-layers';
import { scaleLinear } from 'd3-scale';
import { mat4, vec3 } from 'gl-matrix';
import { registerLoaders } from '@loaders.gl/core';
import { DracoWorkerLoader } from '@loaders.gl/draco';
import { CesiumIonLoader } from '@loaders.gl/3d-tiles';
import CityModelLayer from '../lib/CityModelLayer';
import GroundSurfaceLayer from '../lib/GroundSurfaceLayer';
import PoiLayer from '../lib/PoiLayer';
// import { ViewProps } from '@deck.gl/core/views/view';
// import { LayerProps } from '@deck.gl/core/lib/layer';

export type JsonProps = {
  views?: ViewProps[];
  layers?: LayerProps<any>[];
  // todo: add the rest of props
};

// Note: deck already registers JSONLoader...
registerLoaders([DracoWorkerLoader]);

function isFunctionObject(value) {
  return typeof value === 'object' && '@@function' in value;
}

export function addUpdateTriggersForAccessors(json) {
  if (!json || !json.layers) return;

  for (const layer of json.layers) {
    const updateTriggers = {};
    for (const [key, value] of Object.entries(layer)) {
      if (
        (key.startsWith('get') && typeof value === 'string') ||
        isFunctionObject(value)
      ) {
        // it's an accessor and it's a string
        // we add the value of the accesor to update trigger to refresh when it changes
        updateTriggers[key] = value;
      }
    }
    if (Object.keys(updateTriggers).length) {
      layer.updateTriggers = updateTriggers;
    }
  }
}

function getLinearScale({ domain }) {
  return scaleLinear().domain(domain);
}

function getGridMatrix({ size }) {
  const m = getOffsetMatrix({ size });
  return mat4.scale(m, m, vec3.fromValues(size, size, size));
}

function getOffsetMatrix({ size }) {
  const half = size * 0.5;
  const position = vec3.negate(
    vec3.create(),
    vec3.fromValues(half, half, half)
  );
  return mat4.fromTranslation(mat4.create(), position);
}

function getTranslateMatrix({ translate }) {
  return mat4.fromTranslation(
    mat4.create(),
    vec3.fromValues(translate[0] || 0, translate[1] || 0, translate[2] || 0)
  );
}

export default {
  classes: {
    MapView,
    ScatterplotLayer,
    CityModelLayer,
    GroundSurfaceLayer,
    PoiLayer,
    LineLayer,
    GeoJsonLayer,
    QuadkeyLayer,
    MVTLayer,
    SolidPolygonLayer,
  },
  functions: {
    getLinearScale,
    getGridMatrix,
    getTranslateMatrix,
  },
  enumerations: {
    COORDINATE_SYSTEM,
    GL,
  },
  constants: {
    CesiumIonLoader: CesiumIonLoader as any,
  },
};
