// Copyright (C) 2022 Andreas Rudenå
// Licensed under the MIT License

import {
  Deck,
  Layer as DeckLayer,
  LayerProps,
  MapViewState,
} from '@deck.gl/core';
import '@luma.gl/debug';
class UiStore {
  viewStore: ViewStore;
  constructor(store) {
    this.viewStore = store.viewStore;
  }
}

const layerGroupCatalog = [];

class LayerGroup {
  title: string;
  description: string;
  layers: Layer[];
}

class Layer {
  type: string;
  props: LayerProps;
  instance: DeckLayer;
}

class ViewStore {
  viewState: MapViewState;
  getViewState() {
    return this.viewState;
  }
}

class LayerStore {
  layerGroups: LayerGroup[];
  constructor() {
    this.layerGroups = layerGroupCatalog;
  }
  getLayers() {
    return this.layerGroups.reduce((acc, group) => {
      return [...acc, ...group.layers.map(layer => layer.instance)];
    }, []);
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
  },
};

export class Store {
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
    this.layerStore = new LayerStore();
  }

  update() {
    const viewState = this.viewStore.getViewState();
    const layers = this.layerStore.getLayers();
    this.deck.setProps({
      viewState,
      layers,
    });
  }
}
