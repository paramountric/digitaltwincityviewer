// Copyright (C) 2022 Andreas Rudenå
// Licensed under the MIT License

import { Deck, MapViewState } from '@deck.gl/core';
import { reaction, makeObservable, observable } from 'mobx';
import { LayerStore } from './store/LayerStore';
class UiStore {
  viewStore: ViewStore;
  constructor(store) {
    this.viewStore = store.viewStore;
  }
}

class ViewStore {
  viewState: MapViewState;
  rootStore: RootStore;
  constructor(rootStore) {
    this.rootStore = rootStore;
  }
  getViewState() {
    return this.rootStore.deck.viewManager
      ? this.rootStore.deck.viewManager.getViewState()
      : {};
  }
  setViewState(viewState) {
    const existingViewState = this.getViewState();
    this.rootStore.updateProps({
      viewState: Object.assign({}, existingViewState, viewState),
    });
  }
}

type RootStoreProps = {
  longitude?: number;
  latitude?: number;
  zoom?: number;
};

const defaultProps = {
  debug: false,
  controller: true,
  viewState: {
    longitude: 0,
    latitude: 0,
    zoom: 14,
    target: [0, 0, 0],
    pitch: 60,
    bearing: 0,
  },
  glOptions: {
    antialias: true,
    depth: false,
  },
  layers: [],
  onWebGLInitialized: (): void => null,
  onViewStateChange: ({ viewState }) => viewState,
};

export class RootStore {
  gl: WebGL2RenderingContext;
  deck: Deck;
  uiStore: UiStore;
  viewStore: ViewStore;
  layerStore: LayerStore;
  constructor(props: RootStoreProps = {}) {
    this.viewStore = new ViewStore(this);
    this.uiStore = new UiStore(this);
    this.layerStore = new LayerStore(this);

    const resolvedProps = Object.assign({}, defaultProps, props);
    resolvedProps.onViewStateChange = ({ viewState }) => {
      this.viewStore.setViewState(viewState);
    };
    resolvedProps.onWebGLInitialized = this.onWebGLInitialized.bind(this);

    this.deck = new Deck(resolvedProps);

    const { longitude, latitude, zoom } = props;
    if (longitude && latitude) {
      resolvedProps.viewState.longitude = longitude;
      resolvedProps.viewState.latitude = latitude;
    }
    if (zoom) {
      resolvedProps.viewState.zoom = zoom;
    }
    this.viewStore.setViewState(resolvedProps.viewState);
  }

  onWebGLInitialized(gl) {
    this.gl = gl;
    this.layerStore.updateLayers();
  }

  updateProps(props) {
    this.deck.setProps(props);
  }
}
