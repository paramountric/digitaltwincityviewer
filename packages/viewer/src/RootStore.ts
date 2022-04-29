// Copyright (C) 2022 Andreas Rudenå
// Licensed under the MIT License

import { Deck, MapViewState, MapView } from '@deck.gl/core';
import { reaction, makeObservable, observable } from 'mobx';
import { LayerStore } from './store/LayerStore';
class UiStore {
  viewStore: ViewStore;
  constructor(store) {
    this.viewStore = store.viewStore;
  }
}

const defaultViewStateProps = {
  longitude: 0,
  latitude: 0,
  zoom: 14,
  target: [0, 0, 0],
  pitch: 60,
  bearing: 0,
};

class ViewStore {
  viewState: MapViewState;
  rootStore: RootStore;
  constructor(rootStore) {
    this.rootStore = rootStore;
    this.viewState = defaultViewStateProps;
  }
  getView() {
    return new MapView({
      id: 'main-view',
      controller: true,
      viewState: this.getViewState(),
    });
  }
  getViewState() {
    return this.viewState;
  }
  setViewState({ longitude, latitude, zoom }: RootStoreProps) {
    const existingViewState = this.getViewState();
    const newViewState = Object.assign({}, existingViewState, {
      longitude: longitude || defaultViewStateProps.longitude,
      latitude: latitude || defaultViewStateProps.latitude,
      zoom: zoom || defaultViewStateProps.zoom,
    });
    this.viewState = newViewState;
  }
}

type RootStoreProps = {
  longitude?: number;
  latitude?: number;
  zoom?: number;
};

const defaultProps = {
  debug: false,
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
    resolvedProps.onWebGLInitialized = this.onWebGLInitialized.bind(this);
    resolvedProps.onViewStateChange = this.onViewStateChange.bind(this);
    this.deck = new Deck(resolvedProps);
    this.viewStore.setViewState(props);
  }

  onWebGLInitialized(gl) {
    this.gl = gl;
    this.layerStore.renderLayers();
  }

  onViewStateChange({ viewState }) {
    this.viewStore.setViewState(viewState);
    this.render();
  }

  getProps() {
    return {
      layers: this.layerStore.getLayersInstances(),
      views: this.viewStore.getView(),
    };
  }

  render() {
    const props = this.getProps();
    this.deck.setProps(props);
  }
}
