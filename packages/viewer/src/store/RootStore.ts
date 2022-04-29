// Copyright (C) 2022 Andreas Rudenå
// Licensed under the MIT License

import { Deck, MapViewState, MapView } from '@deck.gl/core';
import { LayerSpecification, Map, MapOptions } from 'maplibre-gl';
import { reaction, makeObservable, observable } from 'mobx';
import { LayerStore } from './LayerStore';
import MaplibreWrapper from '../utils/MaplibreWrapper';
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

const maplibreStyle = {
  id: 'digitaltwincityviewer',
  layers: [
    {
      id: 'background',
      type: 'background',
      paint: {
        'background-color': 'rgba(255, 255, 255, 1)',
      },
    },
  ],
  sources: {},
  version: 8,
};

const maplibreOptions = {
  container: 'canvas',
  accessToken: 'wtf',
  renderWorldCopies: false,
  antialias: true,
  style: maplibreStyle,
  center: [0, 0],
  zoom: 14, // starting zoom
  minZoom: 10,
  pitch: 60,
  attributionControl: false,
} as MapOptions;

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
  debug: true,
  viewState: null,
  glOptions: {
    antialias: true,
    depth: false,
  },
  layers: [],
  onWebGLInitialized: (): void => null,
  onViewStateChange: ({ viewState }) => viewState,
};

const useMaplibre = true;

export class RootStore {
  gl: WebGL2RenderingContext;
  deck: Deck;
  uiStore: UiStore;
  viewStore: ViewStore;
  layerStore: LayerStore;
  maplibreMap?: Map;
  constructor(props: RootStoreProps = {}) {
    this.viewStore = new ViewStore(this);
    this.uiStore = new UiStore(this);
    this.layerStore = new LayerStore(this);

    const resolvedProps = Object.assign({}, defaultProps, props);

    if (useMaplibre) {
      this.maplibre(resolvedProps);
    } else {
      resolvedProps.onWebGLInitialized = this.onWebGLInitialized.bind(this);
      resolvedProps.onViewStateChange = this.onViewStateChange.bind(this);
      resolvedProps.viewState = this.viewStore.getViewState();
      this.deck = new Deck(resolvedProps);
    }
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
    if (useMaplibre) {
      return {
        layers: this.layerStore.getLayersInstances(),
      };
    }
    return {
      layers: this.layerStore.getLayersInstances(),
      views: this.viewStore.getView(),
    };
  }

  setSelectedObject(object) {
    console.log(object);
  }

  render() {
    const props = this.getProps();
    this.deck.setProps(props);
  }

  maplibre(props) {
    const container = document.createElement('div');
    container.setAttribute('id', 'canvas');
    container.style.width = '100%'; //window.innerWidth;
    container.style.height = '100%'; //window.innerHeight;
    container.style.position = 'absolute';
    container.style.top = '0px';
    container.style.left = '0px';
    container.style.background = '#100';
    document.body.appendChild(container);
    props.container = container;

    this.maplibreMap = new Map(maplibreOptions);

    this.maplibreMap.on('load', () => {
      const gl = this.maplibreMap.painter.context.gl;
      this.deck = new Deck(
        Object.assign(props, {
          gl,
        })
      );

      this.maplibreMap.addLayer(
        new MaplibreWrapper({
          id: 'viewer',
          deck: this.deck,
        }) as LayerSpecification
      );

      this.maplibreMap.on('move', () => {
        const { lng, lat } = this.maplibreMap.getCenter();
        this.deck.setProps({
          viewState: {
            longitude: lng,
            latitude: lat,
            zoom: this.maplibreMap.getZoom(),
            bearing: this.maplibreMap.getBearing(),
            pitch: this.maplibreMap.getPitch(),
          },
        });
        // Prevent deck from redrawing - repaint is driven by maplibre's render loop
        this.deck.needsRedraw({ clearRedrawFlags: true });
      });

      this.render();
    });
  }
}
