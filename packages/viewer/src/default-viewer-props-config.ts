// This code is derived from deck.gl under MIT license:
// https://github.com/visgl/deck.gl/tree/master/examples/playground/src

import { COORDINATE_SYSTEM, MapView } from '@deck.gl/core/typed';
import {
  ScatterplotLayer,
  LineLayer,
  GeoJsonLayer,
  SolidPolygonLayer,
  PointCloudLayer,
} from '@deck.gl/layers/typed';
import GL from '@luma.gl/constants';
import { scaleLinear } from 'd3-scale';
import { mat4, vec3 } from 'gl-matrix';
import { registerLoaders } from '@loaders.gl/core';
import { DracoWorkerLoader } from '@loaders.gl/draco';
import { CesiumIonLoader } from '@loaders.gl/3d-tiles';

export function getDefaultViewerProps(viewer) {
  return {
    debug: false,
    glOptions: {
      antialias: true,
      depth: true,
    },
    layers: [],
    useDevicePixels: true,
    getCursor: viewer.getCursor.bind(this),
  };
}

// Note: deck already registers JSONLoader...
registerLoaders([DracoWorkerLoader]);

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

// add all config that is provided by default to viewer to used with the JSON converter
// this can be complemented or overwritten by dependency injection when the viewer inits
export const defaultViewerPropsJsonConfig = {
  classes: {
    MapView,
    ScatterplotLayer,
    LineLayer,
    GeoJsonLayer,
    SolidPolygonLayer,
    PointCloudLayer,
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
