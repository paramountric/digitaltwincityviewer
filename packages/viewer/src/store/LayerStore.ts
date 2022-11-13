// Copyright (C) 2022 Andreas Rudenå
// Licensed under the MIT License

import { LayerProps, COORDINATE_SYSTEM } from '@deck.gl/core';
import { SolidPolygonLayer, GeoJsonLayer } from '@deck.gl/layers';
import { SimpleMeshLayer } from '@deck.gl/mesh-layers';
import { TripsLayer, MVTLayer } from '@deck.gl/geo-layers';
import GL from '@luma.gl/constants';
import { Geometry } from '@luma.gl/engine';
import { mat4 } from 'gl-matrix';
import { findCity } from '@dtcv/cities';
import { Viewer } from '../Viewer.js';
import GroundSurfaceLayer from '../layers/ground-surface-layer/GroundSurfaceLayer.js';
import BuildingSurfaceLayer from '../layers/building-surface-layer/BuildingSurfaceLayer.js';
import { generateColor } from '../utils/colors.js';

export type UpdateLayerProps = {
  layerId: string;
  props?: LayerProps;
  state?: LayerState;
  style?: LayerStyle;
};

type LayerState = {
  isLoaded?: boolean;
  isLoading?: boolean;
  highlightAll?: boolean;
  url?: string | null;
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

const HIGHLIGHT_COLOR = [100, 150, 250, 255];

const layerGroupCatalog: LayerGroupState[] = [
  {
    title: 'Basemap',
    description:
      'Adds a vector tile layer given the connection string, use the url field for the service + token',
    layers: [
      {
        type: MVTLayer,
        url: null,
        isLoaded: false,
        isLoading: false,
        isClickable: true,
        isMeshLayer: false,
        props: {
          id: 'vectortiles-basemap',
        },
      },
    ],
  },
  {
    // The purpose of the "import geojson" layer is to show geojson data and let the user decide what is what according to a type system (schema or linked data)
    // When the features have been typed, another more specific layer can be used (note that the unique keys of layers will make sure that duplicated representations will be avoided)
    // Example of how to use the geojson layer: A CityJSON file is loaded, however the project need more context around the dataset and imports OSM data (converted to geojson)
    // When the buildings of geojson have been "imported" they are added to for example "some-buildings-lod-1-layer" and should complement the existing lod 1 data from the CityJSON data
    // This layer is in itself multiple layers (composite layer)
    // It can only be used with one geojson dataset at a time
    // (if multiple geojson sources should be able to be visualised at the same time, the layer id needs to be changed dynamically on getProps to avoid multiple layers with same id)
    title: 'Import GeoJson',
    description: 'GeoJson data consist of points, lines and polygons',
    layers: [
      {
        type: GeoJsonLayer,
        url: null,
        isLoaded: false,
        isLoading: false,
        isClickable: true,
        isMeshLayer: false,
        props: {
          id: 'import-geojson',
          pickable: true,
          stroked: true,
          filled: false,
          extruded: false,
          pointType: 'circle',
          lineWidthScale: 1,
          lineWidthMinPixels: 2,
          coordinateSystem: COORDINATE_SYSTEM.METER_OFFSETS,
          getFillColor: d => d.properties.color || [255, 255, 255, 0], // color or transparent - use this to mark the features according to status (valid, typed but unvalid, etc)
          getLineColor: [100, 100, 100, 100],
          getPointRadius: 10,
          getLineWidth: 1,
        },
      },
    ],
  },
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
        },
      },
    ],
  },
  {
    title: 'Ground',
    description: 'Ground result layer',
    layers: [
      {
        type: GroundSurfaceLayer,
        url: null,
        isLoaded: false,
        isLoading: false,
        isClickable: false,
        isMeshLayer: true,
        props: {
          id: 'ground-layer-result-mesh',
          data: [1],
          _instanced: false,
          _useMeshColors: true,
          wireframe: false,
          coordinateSystem: COORDINATE_SYSTEM.METER_OFFSETS,
          getPosition: d => [0, 0, 0],
          parameters: {
            depthTest: true,
          },
          getColor: d => [200, 200, 200],
        },
      },
    ],
  },
  {
    title: 'Ground',
    description: 'Ground result layer 2',
    layers: [
      {
        type: GroundSurfaceLayer,
        url: null,
        isLoaded: false,
        isLoading: false,
        isClickable: false,
        isMeshLayer: true,
        props: {
          id: 'ground-layer-result-mesh-2',
          data: [1],
          _instanced: false,
          _useMeshColors: true,
          wireframe: false,
          coordinateSystem: COORDINATE_SYSTEM.METER_OFFSETS,
          getPosition: d => [0, 0, 0],
          parameters: {
            depthTest: true,
          },
          getColor: d => [200, 200, 200],
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
          getColor: [235, 235, 255],
        },
      },
    ],
  },
  {
    title: 'City furniture simple representation',
    description: 'Simple geometry objects for City furniture extension',
    layers: [
      {
        type: GeoJsonLayer,
        url: null,
        isLoaded: false,
        isLoading: false,
        isClickable: true,
        isMeshLayer: false,
        props: {
          id: 'city-furniture-general-layer-lod-1',
          autoHighlight: true,
          highlightColor: HIGHLIGHT_COLOR,
          pickable: true,
          stroked: true,
          filled: true,
          extruded: false,
          pointType: 'circle',
          lineWidthScale: 1,
          lineWidthMinPixels: 2,
          coordinateSystem: COORDINATE_SYSTEM.METER_OFFSETS,
          getFillColor: d => [100, 100, 100, 100],
          getLineColor: [100, 100, 100, 255],
          getPointRadius: 10,
          getLineWidth: 1,
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
          getColor: [235, 235, 255],
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
          highlightColor: HIGHLIGHT_COLOR,
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
          autoHighlight: true,
          highlightColor: HIGHLIGHT_COLOR,
          data: [],
          _instanced: false,
          _useMeshColors: true,
          wireframe: false,
          pickable: true,
          // onHover: e => {
          //   console.log(e);
          // },
          coordinateSystem: COORDINATE_SYSTEM.METER_OFFSETS,
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
          getColor: [235, 235, 255],
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
          id: 'buildings-layer-windows-lod-3',
          autoHighlight: true,
          highlightColor: HIGHLIGHT_COLOR,
          data: [],
          _instanced: false,
          _useMeshColors: true,
          wireframe: false,
          pickable: true,
          // onHover: e => {
          //   console.log(e);
          // },
          coordinateSystem: COORDINATE_SYSTEM.METER_OFFSETS,
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
          getColor: [235, 235, 255],
        },
      },
    ],
  },
  {
    title: 'City furniture',
    description: 'City furniture layer',
    layers: [
      {
        type: SolidPolygonLayer,
        url: null,
        isLoaded: false,
        isLoading: false,
        isClickable: true,
        isMeshLayer: false,
        props: {
          id: 'city-furniture-polygon-layer-lod-1',
          opacity: 1,
          autoHighlight: true,
          highlightColor: HIGHLIGHT_COLOR,
          extruded: true,
          wireframe: true,
          pickable: true,
          coordinateSystem: COORDINATE_SYSTEM.METER_OFFSETS,
          getPolygon: d => {
            return d.geometry.coordinates;
          },
          getFillColor: d => d.properties.color || [255, 255, 255, 255],
          getLineColor: [100, 100, 100],
          getElevation: d => {
            return d.properties.height || 1;
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
        type: SimpleMeshLayer,
        url: null,
        isLoaded: false,
        isLoading: false,
        isClickable: true,
        isMeshLayer: true,
        props: {
          id: 'city-furniture-layer-lod-2',
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
    title: 'CityGML ADE LOD 1',
    description: 'Simple geometry objects for CityGML extension',
    layers: [
      {
        type: GeoJsonLayer,
        url: null,
        isLoaded: false,
        isLoading: false,
        isClickable: true,
        isMeshLayer: false,
        props: {
          id: 'citygml-ade-lod-1',
          autoHighlight: true,
          highlightColor: HIGHLIGHT_COLOR,
          pickable: true,
          stroked: true,
          filled: true,
          extruded: false,
          pointType: 'circle',
          lineWidthScale: 1,
          lineWidthMinPixels: 2,
          coordinateSystem: COORDINATE_SYSTEM.METER_OFFSETS,
          getFillColor: d =>
            d.properties.color
              ? [
                  d.properties.color[0],
                  d.properties.color[1],
                  d.properties.color[2],
                  100,
                ]
              : [255, 215, 0, 100],
          getLineColor: d =>
            d.properties.color
              ? [
                  d.properties.color[0],
                  d.properties.color[1],
                  d.properties.color[2],
                  255,
                ]
              : [255, 215, 0, 255],
          getPointRadius: 5,
          getLineWidth: 1,
        },
      },
    ],
  },
  {
    title: 'Movement layer',
    description: 'This layer shows movement trails',
    layers: [
      {
        type: TripsLayer,
        url: null,
        isLoaded: false,
        isLoading: false,
        isMeshLayer: false,
        isClickable: false,
        props: {
          id: 'movement-layer',
          getPath: d => d.geometry.coordinates.map(p => [p[0], p[1]]),
          getTimestamps: d => d.geometry.coordinates.map(p => p[3]),
          getColor: [253, 128, 93],
          opacity: 0.8,
          widthMinPixels: 5,
          rounded: true,
          fadeTrail: true,
          trailLength: 984,
          currentTime: 100,
        },
      },
    ],
  },
];

export class LayerStore {
  layerGroups: LayerGroupState[];
  viewer: Viewer;
  // cached layer offset from 0,0 relative to ref city webmerc x,y
  layerOffset: [number, number];
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
      } else if (!layer.props.data?.length && !layer.props.nodes) {
        return acc;
      }
      // not happy with re-assigning the event callback every time..
      if (layer.isClickable) {
        layer.props.onClick = d => {
          if (d.object) {
            this.viewer.setSelectedObject(d.object);
            return;
          }
          const object = d.layer.props.data[0]?.objects[d.index];
          if (!object) {
            console.warn('clicked object could not be found', d);
            return;
          }
          this.viewer.setSelectedObject(object);
        };
      }
      // if (layer.isHoverable) {
      //   layer.props.onHover = d => {
      //     if (d.object) {
      //       this.viewer.setHoveredObject(d.object);
      //     } else {
      //       this.viewer.setHoveredObject(null);
      //     }
      //   };
      // }
      // todo: refactor this into dynamic props assignment in original spec
      if (layer.highlightAll) {
        // just prototyping to try out highlighting the layer
        layer.props.prevGetColor =
          layer.props.prevGetColor || layer.props.getColor;
        layer.props.prevGetFillColor =
          layer.props.prevGetFillColor || layer.props.getFillColor;
        layer.props.prevGetLineColor =
          layer.props.prevGetLineColor || layer.props.getLineColor;
        layer.props._useMeshColors = false;
        layer.props.getColor = HIGHLIGHT_COLOR;
        layer.props.getFillColor = HIGHLIGHT_COLOR;
        layer.props.getLineColor = HIGHLIGHT_COLOR;
        layer.props.updateTriggers = {
          getFillColor: true,
          getLineColor: true,
        };
      } else if (layer.props.prevGetColor || layer.props.prevGetFillColor) {
        layer.props._useMeshColors = layer.isMeshLayer ? true : false;
        layer.props.getColor = layer.props.prevGetColor;
        layer.props.getFillColor = layer.props.prevGetFillColor;
        layer.props.getLineColor = layer.props.prevGetLineColor;
        layer.props.updateTriggers = {
          getFillColor: false,
          getLineColor: false,
        };
      }
      if (layer.props.id === 'graph-layer') {
        // layer.props.onHover = d => {
        //   if (d.object) {
        //     console.log(d.object);
        //     this.viewer.setHoveredGraphObject(d.object);
        //   } else {
        //     this.viewer.setHoveredGraphObject(null);
        //   }
        // };
      }
      if (layer.type === MVTLayer) {
        layer.props.data = layer.props.url;
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
    //this.viewer.render();
  }
  setLayerProps(layerId, props: LayerProps) {
    // todo: look into immutability
    const layer = this.getLayerById(layerId);
    if (!layer) {
      console.warn('layer was not found with the id: ', layerId);
      return;
    }

    // (epsg:3857)
    if (props.center) {
      // todo: figure out a way to set the current city and center the data that is loaded
      if (!this.viewer.currentCity) {
        this.viewer.currentCity = findCity(props.center[0], props.center[1]);
        console.log(this.viewer.currentCity);
      }
      const currentCity = this.viewer.currentCity;
      const layerOffset = [
        currentCity.x - props.center[0],
        currentCity.y - props.center[1],
      ];
      const viewerCenter = [layerOffset[0] * -1, layerOffset[1] * -1];
      this.viewer.setCenter(viewerCenter);
      this.layerOffset = viewerCenter as [number, number];
      // here the mutation is troublesome, so better refactor this function to make props immutable
      props = Object.assign({}, props);
      props.modelMatrix = (props.modelMatrix || mat4.create()).slice();
      props.modelMatrix[12] -= layerOffset[0];
      props.modelMatrix[13] -= layerOffset[1];
    } else if (this.layerOffset && !layer.props.modelMatrix) {
      props.modelMatrix = mat4.create();
      props.modelMatrix[12] = this.layerOffset[0];
      props.modelMatrix[13] = this.layerOffset[1];
    } else {
      console.warn('layer has no center, and city is not set: ', props);
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
      props.data = [props.data];
    }
    layer.props = Object.assign(layer.props, props);
  }
  getLayerData(layerId) {
    const layer = this.getLayerById(layerId);
    if (!layer) {
      return null;
    }
    const { data } = layer.props;
    if (!data) {
      return null;
    }
    if (layer.isMeshLayer) {
      return data[0]?.objects;
    } else {
      return data;
    }
  }
  renderLayers() {
    //this.viewer.render();
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
    //this.viewer.render();
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
