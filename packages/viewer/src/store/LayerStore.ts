// Copyright (C) 2022 Andreas Rudenå
// Licensed under the MIT License

import { LayerProps, COORDINATE_SYSTEM } from '@deck.gl/core';
import { SolidPolygonLayer } from '@deck.gl/layers';
import GL from '@luma.gl/constants';
import { Geometry } from '@luma.gl/engine';
import { Viewer } from '../Viewer';
import GroundSurfaceLayer from '../layers/ground-surface-layer/GroundSurfaceLayer';
import { mat4 } from 'gl-matrix';

const layerGroupCatalog: LayerGroupState[] = [
  {
    title: 'Ground',
    description: 'Ground layer',
    layers: [
      {
        type: GroundSurfaceLayer,
        url: null,
        isLoaded: false,
        isLoading: false,
        isClickable: false,
        props: {
          id: 'ground-layer-surface-mesh',
          data: [1],
          _instanced: false,
          wireframe: false,
          coordinateSystem: COORDINATE_SYSTEM.METER_OFFSETS,
          getPosition: d => [0, 0, 0],
          parameters: {
            depthTest: true,
          },
          getColor: d => [235, 235, 255],
          waterLevel: 0,
        },
      },
    ],
  },
  {
    title: 'Buildings',
    description: 'Buildings layer',
    layers: [
      {
        type: SolidPolygonLayer,
        url: null,
        isLoaded: false,
        isLoading: false,
        isClickable: true,
        props: {
          id: 'buildings-layer-polygons-lod-1',
          opacity: 0.7,
          autoHighlight: true,
          highlightColor: [100, 150, 250, 128],
          extruded: true,
          wireframe: true,
          pickable: true,
          coordinateSystem: COORDINATE_SYSTEM.METER_OFFSETS,
          getPolygon: d => d.geometry.coordinates,
          getFillColor: [200, 200, 220, 200],
          getLineColor: [100, 100, 100],
          getElevation: d => {
            return d.properties.height;
          },
          useDevicePixels: true,
          parameters: {
            depthMask: true,
            depthTest: true,
            blend: true,
            blendFunc: [
              GL.SRC_ALPHA,
              GL.ONE_MINUS_SRC_ALPHA,
              GL.ONE,
              GL.ONE_MINUS_SRC_ALPHA,
            ],
            polygonOffsetFill: true,
            depthFunc: GL.LEQUAL,
            blendEquation: GL.FUNC_ADD,
          },
        },
      },
    ],
  },
];

type LayerGroupState = {
  title: string;
  description: string;
  layers: Layer[];
};

class Layer {
  type: any;
  url?: string;
  isLoaded: boolean;
  isLoading: boolean;
  isClickable: boolean;
  props: LayerProps;
}

export class LayerStore {
  layerGroups: LayerGroupState[];
  viewer: Viewer;
  constructor(viewer) {
    this.viewer = viewer;
    this.layerGroups = layerGroupCatalog;
  }
  getLayerById(layerId: string) {
    for (const layerGroup of this.layerGroups) {
      for (const layer of layerGroup.layers) {
        if (layer.props.id === layerId) {
          return layer;
        }
      }
    }
    return null;
  }
  getLayers() {
    return this.layerGroups.reduce((acc, group) => {
      return [...acc, ...group.layers];
    }, []);
  }
  getLayersInstances() {
    const layers = this.getLayers();
    return layers.reduce((acc, layer) => {
      console.log(layer);
      if (layer.isLoading) {
        return acc;
      } else if (!layer.isLoaded) {
        this.loadLayer(layer);
        return acc;
      } else if (!layer.props.data?.length) {
        return acc;
      }
      // not happy with re-assigning the event callback every time..
      if (layer.isClickable) {
        layer.props.onClick = d => {
          this.viewer.setSelectedObject(d.object);
        };
      }
      return [...acc, new layer.type(layer.props)];
    }, []);
  }
  setLayerProps(layerId, props = {} as LayerProps, layerSettings = {}) {
    // todo: look into immutability
    const layer = this.getLayerById(layerId);
    if (!layer) {
      console.warn('layer was not found with the id: ', layerId);
      return;
    }
    // in a few places we have the problem that props needs functions and instances
    if (
      layerId === 'ground-layer-surface-mesh' &&
      props.data &&
      !layer.isLoaded
    ) {
      props.mesh = new Geometry({
        attributes: {
          positions: new Float32Array(props.data.vertices),
        },
        indices: { size: 1, value: new Uint32Array(props.data.indices) },
      });
      props.data = [1];
    }
    Object.assign(layer, layerSettings);
    layer.props = Object.assign(layer.props, props);
  }
  renderLayers() {
    this.viewer.render();
  }
  setLayerData(layerId, data) {
    this.setLayerProps(layerId, { data });
  }

  // The layers should only be loaded here if they already are in a prepared format and can be loaded straight into the viewer
  // for any other fileformat, the calling application must first load the file and run it through some of the preprocessors/parsers in packages
  async loadLayer(layer: Layer) {
    if (!layer.url) {
      console.warn('No data url has been given for this layer');
      return;
    }
    this.setLayerProps(layer.props.id, null, { isLoading: true });
    const response = await fetch(layer.url);
    const json = await response.json();
    const { data, modelMatrix = mat4.create() } = json;
    // todo: validation needed, and a specification for exactly how this JSON must look
    this.setLayerProps(
      layer.props.id,
      { data, modelMatrix },
      { isLoaded: true, isLoading: false }
    );
    this.renderLayers();
  }
}
