// Copyright (C) 2022 Andreas Rudenå
// Licensed under the MIT License

import {
  Deck,
  LayerProps,
  MapViewState,
  COORDINATE_SYSTEM,
} from '@deck.gl/core';
import { SurfaceMeshLayer } from './SurfaceMeshLayer';
import { SimpleMeshLayer } from '@deck.gl/mesh-layers';
import { ScatterplotLayer } from '@deck.gl/layers';
import '@luma.gl/debug';
import { reaction, makeObservable, observable } from 'mobx';
class UiStore {
  viewStore: ViewStore;
  constructor(store) {
    this.viewStore = store.viewStore;
  }
}

const fileName = 'Helsingborg2021.json';

const layerGroupCatalog: LayerGroupState[] = [
  {
    title: 'Ground',
    description: 'Ground layer',
    layers: [
      {
        type: SimpleMeshLayer,
        props: {
          id: 'ground-mesh-layer',
          data: `https://dtcc-js-assets.s3.eu-north-1.amazonaws.com/${fileName}`,
          wireframe: false,
          coordinateSystem: COORDINATE_SYSTEM.METER_OFFSETS,
          parameters: {
            depthTest: true,
          },
        },
      },
      {
        type: ScatterplotLayer,
        props: {
          id: 'test-layer',
          data: [
            {
              coordinates: [0, 0],
            },
          ],
          pickable: true,
          opacity: 0.8,
          stroked: true,
          filled: true,
          radiusScale: 6,
          radiusMinPixels: 1,
          radiusMaxPixels: 100,
          lineWidthMinPixels: 1,
          getPosition: d => d.coordinates,
          getRadius: d => 10,
          getFillColor: d => [255, 140, 0],
          getLineColor: d => [0, 0, 0],
          coordinateSystem: COORDINATE_SYSTEM.METER_OFFSETS,
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
  props: LayerProps;
}

class ViewStore {
  viewState: MapViewState;
  getViewState() {
    return this.viewState;
  }
}

class LayerStore {
  layerGroups: LayerGroupState[];
  rootStore: RootStore;
  constructor(rootStore) {
    this.rootStore = rootStore;
    this.layerGroups = layerGroupCatalog;
    this.updateLayers();
    //this.loadLayers();
    // reaction(
    //   () => this.layerGroups,
    //   newGroups => {
    //     console.log(newGroups);
    //   }
    // );
  }
  // loadLayers() {
  //   const layers = this.getLayers();
  //   console.log(layers);
  //   for (const layer of layers) {
  //     if (!layer.isLoaded) {
  //       layer.instance = new layer.type(layer.props);
  //       console.log(layer.instance);
  //       layer.instance.props.fetch(
  //         `https://dtcc-js-assets.s3.eu-north-1.amazonaws.com/${fileName}`
  //       );
  //     }
  //   }
  // }
  onDataLoad(value, context) {
    console.log(value, context, this);
    return {};
  }
  getLayers() {
    return this.layerGroups.reduce((acc, group) => {
      return [...acc, ...group.layers];
    }, []);
  }
  getLayersInstances() {
    const layers = this.getLayers();
    return layers.map(layer => {
      layer.props.onDataLoad = this.onDataLoad.bind(this);
      return new layer.type(layer.props);
    });
  }
  updateLayers() {
    this.rootStore.updateLayers(this.getLayersInstances());
  }
}

class AuthStore {}

type StoreProps = {
  longitude?: number;
  latitude?: number;
  zoom?: number;
};

const defaultProps = {
  controller: true,
  initialViewState: {
    longitude: 0,
    latitude: 0,
    zoom: 0,
    // longitude: 12.769772664016791,
    // latitude: 56.05114507504894,
    // target: [0, 0, 0],
    // zoom: 14,
    // pitch: 60,
    // bearing: 0,
  },
};

export class RootStore {
  deck: Deck;
  authStore: AuthStore;
  uiStore: UiStore;
  viewStore: ViewStore;
  layerStore: LayerStore;
  constructor(props: StoreProps = {}) {
    const { longitude, latitude, zoom } = props;
    const resolvedProps = Object.assign({}, defaultProps, props);
    if (longitude && latitude) {
      resolvedProps.initialViewState.longitude = longitude;
      resolvedProps.initialViewState.latitude = latitude;
    }
    if (zoom) {
      resolvedProps.initialViewState.zoom = zoom;
    }
    this.deck = new Deck(resolvedProps);
    this.authStore = new AuthStore();
    this.uiStore = new UiStore(this);
    this.viewStore = new ViewStore();
    this.layerStore = new LayerStore(this);
  }

  updateLayers(layers) {
    this.deck.setProps({ layers });
  }
}
