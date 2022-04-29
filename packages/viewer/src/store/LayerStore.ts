// Copyright (C) 2022 Andreas Rudenå
// Licensed under the MIT License

import { LayerProps, COORDINATE_SYSTEM } from '@deck.gl/core';
import { SolidPolygonLayer } from '@deck.gl/layers';
import GL from '@luma.gl/constants';
import { Geometry } from '@luma.gl/engine';
import { RootStore } from './RootStore';
import GroundSurfaceLayer from '../layers/ground-surface-layer/GroundSurfaceLayer';
import { parseCityModel } from '../utils/parser';

const layerGroupCatalog: LayerGroupState[] = [
  {
    title: 'Ground',
    description: 'Ground layer',
    layers: [
      {
        type: GroundSurfaceLayer,
        url: 'http://localhost:9000/files/citymodel/Helsingborg2021.json',
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
          getColor: d => {
            return [235, 235, 255];
          },
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
        url: 'http://localhost:9000/files/citymodel/Helsingborg2021.json',
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
  rootStore: RootStore;
  constructor(rootStore) {
    this.rootStore = rootStore;
    this.layerGroups = layerGroupCatalog;
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
      }
      if (layer.isClickable) {
        layer.props.onClick = d => {
          this.rootStore.setSelectedObject(d.object);
        };
      }
      return [...acc, new layer.type(layer.props)];
    }, []);
  }
  setLayerProps(layerId, props = {}, layerSettings = {}) {
    // todo: look into immutability
    const layerGroup = this.layerGroups.find(layerGroup =>
      layerGroup.layers.find(layer => layer.props.id === layerId)
    );
    const layer = layerGroup.layers.find(layer => layer.props.id === layerId);
    Object.assign(layer, layerSettings);
    layer.props = Object.assign(layer.props, props);
  }
  renderLayers() {
    this.rootStore.render();
  }

  // ! this part is still unclear - the layers should be able to load separately and from different urls
  // ! but here layers have the same data source (city model), so it's loading and parses once for each layer, obviously very bad
  // ! consider having a url hierarchy
  async loadLayer(layer: Layer) {
    if (!layer.url) {
      console.warn('No data url has been given for this layer');
      return;
    }
    this.setLayerProps(layer.props.id, null, { isLoading: true });
    const response = await fetch(layer.url);
    const json = await response.json();
    if (layer.props.id === 'buildings-layer-polygons-lod-1') {
      const { buildings, modelMatrix } = parseCityModel(json);

      this.setLayerProps(
        layer.props.id,
        { data: buildings, modelMatrix },
        { isLoaded: true, isLoading: false }
      );
    } else if (layer.props.id === 'ground-layer-surface-mesh') {
      const { ground, modelMatrix } = parseCityModel(json);
      console.log(ground, modelMatrix);
      const groundProps = {
        mesh: new Geometry({
          attributes: {
            positions: new Float32Array(ground.vertices),
          },
          indices: { size: 1, value: new Uint32Array(ground.indices) },
        }),
        modelMatrix,
      };
      this.setLayerProps(layer.props.id, groundProps, {
        isLoaded: true,
        isLoading: false,
      });
    }
    this.renderLayers();
  }
}
