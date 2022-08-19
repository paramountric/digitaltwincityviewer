import { COORDINATE_SYSTEM, GL, MapView } from '@deck.gl/core';
import { ScatterplotLayer, LineLayer, GeoJsonLayer } from '@deck.gl/layers';
import { Tile3DLayer, QuadkeyLayer } from '@deck.gl/geo-layers';
import { scaleLinear } from 'd3-scale';
import { mat4, vec3 } from 'gl-matrix';
import { registerLoaders } from '@loaders.gl/core';
import { DracoWorkerLoader } from '@loaders.gl/draco';
import { Tiles3DLoader, CesiumIonLoader } from '@loaders.gl/3d-tiles';

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

export default {
  classes: {
    ScatterplotLayer,
    MapView,
    LineLayer,
    GeoJsonLayer,
    Tile3DLayer,
    QuadkeyLayer,
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
    Tiles3DLoader: Tiles3DLoader as any,
    CesiumIonLoader: CesiumIonLoader as any,
  },
};
