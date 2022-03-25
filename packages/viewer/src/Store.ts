// Copyright (C) 2022 Andreas Rudenå
// Licensed under the MIT License

import {
  Deck,
  LayerProps,
  MapViewState,
  MapView,
  COORDINATE_SYSTEM,
} from '@deck.gl/core';
import { SurfaceMeshLayer } from './SurfaceMeshLayer';
import { SimpleMeshLayer } from '@deck.gl/mesh-layers';
import { ScatterplotLayer } from '@deck.gl/layers';
import '@luma.gl/debug';
import { Tile3DLayer } from '@deck.gl/geo-layers';
import { Tiles3DLoader } from '@loaders.gl/3d-tiles';
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
        type: Tile3DLayer,
        props: {
          id: 'tile-3d-layer',
          data: 'http://localhost:60844/TilesetWithTreeBillboards/tileset.json',
          loader: Tiles3DLoader,
          // override scenegraph subLayer prop
          _subLayerProps: {
            scenegraph: { _lighting: 'flat' },
          },
        },
      },
      {
        type: ScatterplotLayer,
        props: {
          id: 'test-layer',
          data: [
            {
              coordinates: [-75.61209429047926, 40.04253061601606],
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
          //coordinateSystem: COORDINATE_SYSTEM.METER_OFFSETS,
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
      views: new MapView({
        controller: true,
        viewState: Object.assign({}, existingViewState, viewState),
      }),
    });
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
      layer.props.onTilesetLoad = tileset => {
        const { cartographicCenter, zoom } = tileset;
        console.log(tileset);
        this.rootStore.viewStore.setViewState({
          longitude: cartographicCenter[0],
          latitude: cartographicCenter[1],
          zoom,
        });
      };
      return new layer.type(layer.props);
    });
  }
  updateLayers() {
    this.rootStore.updateProps({ layers: this.getLayersInstances() });
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
  viewState: {
    longitude: 0,
    latitude: 0,
    // longitude: -75.61209429047926,
    // latitude: 40.04253061601606,
    zoom: 15,
    // longitude: 12.769772664016791,
    // latitude: 56.05114507504894,
    target: [0, 0, 0],
    pitch: 60,
    bearing: 0,
  },
  onViewStateChange: ({ viewState }) => viewState,
};

export class RootStore {
  deck: Deck;
  authStore: AuthStore;
  uiStore: UiStore;
  viewStore: ViewStore;
  layerStore: LayerStore;
  constructor(props: StoreProps = {}) {
    const resolvedProps = Object.assign({}, defaultProps, props);
    resolvedProps.onViewStateChange = ({ viewState }) => {
      this.viewStore.setViewState(viewState);
    };

    this.deck = new Deck(resolvedProps);

    this.authStore = new AuthStore();
    this.uiStore = new UiStore(this);
    this.viewStore = new ViewStore(this);
    this.layerStore = new LayerStore(this);

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

  updateProps(props) {
    this.deck.setProps(props);
  }
}
