// Copyright (C) 2022 Andreas Rudenå
// Licensed under the MIT License

import { LayerProps, COORDINATE_SYSTEM } from '@deck.gl/core';
import { SolidPolygonLayer } from '@deck.gl/layers';
import { SimpleMeshLayer } from '@deck.gl/mesh-layers';
import GL from '@luma.gl/constants';
import { Geometry } from '@luma.gl/engine';
import { Viewer } from '../Viewer';
import GroundSurfaceLayer from '../layers/ground-surface-layer/GroundSurfaceLayer';
import BuildingSurfaceLayer from '../layers/building-surface-layer/BuildingSurfaceLayer';
import { mat4 } from 'gl-matrix';
import { generateColor } from '../utils/colors';

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
        isMeshLayer: true,
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
          getColor: d => [200, 200, 200],
          waterLevel: 0,
        },
      },
    ],
  },
  {
    title: 'Land use',
    description: 'Land use layer',
    layers: [
      {
        type: SimpleMeshLayer,
        url: null,
        isLoaded: false,
        isLoading: false,
        isClickable: true,
        isMeshLayer: true,
        props: {
          opacity: 0.5,
          id: 'landuse-layer-surface-lod-1',
          data: [1],
          _instanced: false,
          _useMeshColors: true,
          wireframe: false,
          coordinateSystem: COORDINATE_SYSTEM.METER_OFFSETS,
          getPosition: d => [0, 0, 0],
          parameters: {
            depthTest: true,
          },
          getColor: d => [235, 235, 255],
        },
      },
    ],
  },
  {
    title: 'Transportation',
    description: 'Transportation layer',
    layers: [
      {
        type: SimpleMeshLayer,
        url: null,
        isLoaded: false,
        isLoading: false,
        isClickable: true,
        isMeshLayer: true,
        props: {
          id: 'transportation-layer-traffic-area-lod-2',
          data: [1],
          _instanced: false,
          _useMeshColors: true,
          wireframe: false,
          coordinateSystem: COORDINATE_SYSTEM.METER_OFFSETS,
          getPosition: d => [0, 0, 0],
          parameters: {
            depthTest: true,
          },
          getColor: d => [235, 235, 255],
        },
      },
      {
        type: SimpleMeshLayer,
        url: null,
        isLoaded: false,
        isLoading: false,
        isClickable: true,
        isMeshLayer: true,
        props: {
          id: 'transportation-layer-auxiliary-traffic-area-lod-2',
          data: [1],
          _instanced: false,
          _useMeshColors: true,
          wireframe: false,
          coordinateSystem: COORDINATE_SYSTEM.METER_OFFSETS,
          getPosition: d => [0, 0, 0],
          parameters: {
            depthTest: true,
          },
          getColor: d => [235, 235, 255],
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
        isMeshLayer: false,
        layerStyle: null,
        props: {
          id: 'buildings-layer-polygons-lod-1',
          opacity: 1,
          autoHighlight: true,
          highlightColor: [100, 150, 250, 128],
          extruded: true,
          wireframe: true,
          pickable: true,
          coordinateSystem: COORDINATE_SYSTEM.METER_OFFSETS,
          getPolygon: d => d.geometry.coordinates,
          getFillColor: d => d.properties.color || [255, 255, 255, 255],
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
      {
        type: BuildingSurfaceLayer,
        url: null,
        isLoaded: false,
        isLoading: false,
        isClickable: true,
        isMeshLayer: true,
        props: {
          id: 'buildings-layer-surfaces-lod-3',
          //autoHighlight: true,
          //highlightColor: [0, 0, 0, 128],
          highlightColor: { type: 'accessor', value: [0, 0, 0, 0] },
          data: [],
          _instanced: false,
          _useMeshColors: true,
          wireframe: false,
          pickable: true,
          // onHover: e => {
          //   console.log(e);
          // },
          coordinateSystem: COORDINATE_SYSTEM.METER_OFFSETS,
          getPosition: d => [0, 0, 0],
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
          getColor: d => [235, 235, 255],
        },
      },
    ],
  },
];

type LayerState = {
  isLoaded?: boolean;
  isLoading?: boolean;
  url?: string;
  layerStyle?: LayerStyle;
};

type LayerSetting = LayerState & {
  type: GroundSurfaceLayer | SolidPolygonLayer | SimpleMeshLayer;
  isClickable: boolean;
  isMeshLayer: boolean;
  props: LayerProps;
};

type LayerGroupState = {
  title: string;
  description: string;
  layers: LayerSetting[];
};

// This is supposed to cover 3DTiles styles spec, however, how to do color range according to that spec?
// Extend this type gradually to support the 3DTiles spec
// todo: move out to styling utils
type LayerStyle = {
  color?: ColorStyle;
};
// todo: move out to styling utils
type ColorStyle = {
  propertyKey: string;
  sufficient: number;
  excellent: number;
};

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
          console.log(d);
          const object = d.layer.props.data[0]?.objects[d.index];
          this.viewer.setSelectedObject(object || d.object);
        };
      }
      return [...acc, new layer.type(layer.props)];
    }, []);
  }
  setLayerState(layerId, layerState: LayerState) {
    const layer = this.getLayerById(layerId);
    if (!layer) {
      console.warn('layer was not found with the id: ', layerId);
      return;
    }
    Object.assign(layer, layerState);
    return layer;
  }
  setLayerStyle(layerId, layerStyle: LayerStyle) {
    const layer = this.setLayerState(layerId, {
      layerStyle,
    });
    this.applyLayerStyle(layer);
    this.viewer.render();
  }
  setLayerProps(layerId, props: LayerProps) {
    // todo: look into immutability
    const layer = this.getLayerById(layerId);
    if (!layer) {
      console.warn('layer was not found with the id: ', layerId);
      return;
    }
    // in a few places we have the problem that props needs functions and instances
    if (layer.isMeshLayer && props.data && !layer.isLoaded) {
      props.mesh = new Geometry({
        attributes: {
          positions: new Float32Array(props.data.vertices),
          COLOR_0: { size: 4, value: new Float32Array(props.data.colors) },
        },
        indices: { size: 1, value: new Uint32Array(props.data.indices) },
      });
      console.log(props);
      props.data = [props.data];
    }
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
  async loadLayer(layer: LayerSetting) {
    if (!layer.url) {
      console.warn('No data url has been given for this layer');
      return;
    }
    this.setLayerState(layer.props.id, { isLoading: true });
    const response = await fetch(layer.url);
    const json = await response.json();
    const { data, modelMatrix = mat4.create() } = json;
    // todo: validation needed, and a specification for exactly how this JSON must look
    this.setLayerProps(layer.props.id, { data, modelMatrix });
    this.setLayerState(layer.props.id, { isLoading: false, url: layer.url });
    this.renderLayers();
  }
  unload() {
    const layers = this.getLayers();
    for (const layer of layers) {
      this.setLayerProps(layer.props.id, {
        data: null,
      });
      this.setLayerState(layer.props.id, {
        isLoaded: false,
        url: null,
      });
    }
    this.viewer.render();
  }
  // todo: move out to styling utils
  applyLayerStyle(layer: LayerSetting) {
    const features = layer.props.data;
    const colorStyle = layer.layerStyle?.color;
    if (colorStyle) {
      for (const feature of features) {
        this.setColor(feature, colorStyle);
      }
    }
  }
  // todo: move out to styling utils
  setColor(feature, colorStyle) {
    if (
      feature.properties &&
      colorStyle.propertyKey &&
      colorStyle.sufficient &&
      colorStyle.excellent
    ) {
      const color = generateColor(
        feature.properties[colorStyle.propertyKey],
        colorStyle.sufficient,
        colorStyle.excellent
      );
      feature.properties.color = color;
    }
  }
}
