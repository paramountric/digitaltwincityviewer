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
  setViewState(viewState) {
    const existingViewState = this.getViewState();
    const newViewState = Object.assign({}, existingViewState, viewState);
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
  controller: true,
  views: null,
  viewState: defaultViewStateProps,
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
    //resolvedProps.views = this.viewStore.getView();
    this.deck = new Deck(resolvedProps);

    const { longitude, latitude, zoom } = props;
    if (longitude && latitude) {
      resolvedProps.viewState.longitude = longitude;
      resolvedProps.viewState.latitude = latitude;
    }
    if (zoom) {
      resolvedProps.viewState.zoom = zoom;
    }
    //this.viewStore.setViewState(resolvedProps.viewState);
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
      //onViewStateChange: this.onViewStateChange.bind(this),
      layers: this.layerStore.getLayersInstances(),
      //viewsState: this.viewStore.getViewState(),
      views: this.viewStore.getView(),
    };
  }

  render() {
    const props = this.getProps();
    this.deck.setProps(props);
  }
}
