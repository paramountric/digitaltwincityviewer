// Copyright (C) 2022 Andreas Rudenå
// Licensed under the MIT License

import { LayerProps, COORDINATE_SYSTEM } from '@deck.gl/core';
import { SolidPolygonLayer } from '@deck.gl/layers';
import GL from '@luma.gl/constants';
import { RootStore } from '../RootStore';
import { cityModelToGeoJson } from '../utils/converter';

const layerGroupCatalog: LayerGroupState[] = [
  {
    title: 'Ground',
    description: 'Ground layer',
    layers: [],
  },
  {
    title: 'Buildings',
    description: 'Buildings layer',
    layers: [
      {
        type: SolidPolygonLayer,
        data: [],
        url: 'http://localhost:9000/files/citymodel/Helsingborg2021.json',
        isLoaded: false,
        isLoading: false,
        props: {
          id: 'city-model',
          opacity: 0.7,
          autoHighlight: true,
          // onClick: d => {
          //   //this.setSelectedObject(d.object);
          // },
          // onHover: (info) => {
          //   console.log(info);
          // },
          highlightColor: [100, 150, 250, 128],
          extruded: false,
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
  data: any; // data will be loaded separtely and used as props.data in LayerProps when loaded (the built in layer loader was disabled due to some tricky need for customization)
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
        console.log('load: ', layer.url);
        this.loadLayer(layer);
        return acc;
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
    console.log('update layerProps', layer);
  }
  renderLayers() {
    this.rootStore.render();
  }

  async loadLayer(layer: Layer) {
    if (!layer.url) {
      console.warn('No data url has been given for this layer');
      return;
    }
    this.setLayerProps(layer.props.id, null, { isLoading: true });
    const cityModel = await fetch(layer.url);
    const json = await cityModel.json();
    const converted = cityModelToGeoJson(json);

    this.setLayerProps(
      layer.props.id,
      { data: converted.buildings },
      { isLoaded: true, isLoading: false }
    );
    this.renderLayers();
  }
}
