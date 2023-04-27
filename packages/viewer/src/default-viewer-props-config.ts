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
import { Viewer } from './viewer';
import { ViewerProps } from './viewer-props';

// default viewer props is overwritten by application
export function getDefaultViewerProps(viewer: Viewer) {
  // viewer is passed in to allow for viewer.bind to be used
  // however for many cases this is done after maplibre selection in the viewer constructor
  return {
    glOptions: {
      antialias: true,
      depth: true,
    },
    useDevicePixels: true,
    // for the app to control the cursor, the prop.cursor can be set directly where deck will check this function continuously
    getCursor: viewer.getCursor.bind(viewer),
  };
}

// Note: deck already registers JSONLoader...
registerLoaders([DracoWorkerLoader]);

function getLinearScale({ domain }: any) {
  return scaleLinear().domain(domain);
}

function getGridMatrix({ size }: any) {
  const m = getOffsetMatrix({ size });
  return mat4.scale(m, m, vec3.fromValues(size, size, size));
}

function getOffsetMatrix({ size }: any) {
  const half = size * 0.5;
  const position = vec3.negate(
    vec3.create(),
    vec3.fromValues(half, half, half)
  );
  return mat4.fromTranslation(mat4.create(), position);
}

function getTranslateMatrix({ translate }: any) {
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

// note that any maplibre options sent from app will overwrite these defaults
// the props sent in is to enable the same api for the viewer for common options like lon, lat, zoom etc
export function getDefaultMaplibreOptions(props: ViewerProps) {
  return {
    accessToken: 'wtf',
    renderWorldCopies: false,
    antialias: true,
    style: {
      id: 'digitaltwincityviewer',
      layers: [
        {
          id: 'background',
          type: 'background',
          paint: {
            'background-color': 'rgba(255, 255, 255, 1)',
          },
        },
      ],
      sources: {},
      version: 8,
    },
    center: [props.longitude || 0, props.latitude || 0],
    zoom: props.zoom || props.zoom === 0 ? props.zoom : 14, // starting zoom
    minZoom: props.minZoom || props.minZoom === 0 ? props.minZoom : 10,
    maxZoom: props.maxZoom || props.maxZoom === 0 ? props.maxZoom : 18,
    pitch: props.pitch || props.pitch === 0 ? props.pitch : 60,
    attributionControl: false,
  };
}
