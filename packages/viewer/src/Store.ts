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
import {
  ScatterplotLayer,
  SolidPolygonLayer,
  GeoJsonLayer,
} from '@deck.gl/layers';
import Tile3DLayer from './Tile3DLayer/Tile3DLayer'; //@deck.gl/geo-layers';
import { reaction, makeObservable, observable } from 'mobx';
import TileLayer from './TileLayer';
class UiStore {
  viewStore: ViewStore;
  constructor(store) {
    this.viewStore = store.viewStore;
  }
}

const fileName = 'Helsingborg2021.json';

// todo: try out a layer state observable to rerender the layer when something change
// this gives a viewstate, uistate, authstate and one for each layer props (at least)
const layerGroupCatalog: LayerGroupState[] = [
  {
    title: 'Ground',
    description: 'Ground layer',
    layers: [
      // {
      //   type: SimpleMeshLayer,
      //   props: {
      //     id: 'ground-mesh-layer',
      //     data: `https://dtcc-js-assets.s3.eu-north-1.amazonaws.com/${fileName}`,
      //     wireframe: false,
      //     coordinateSystem: COORDINATE_SYSTEM.METER_OFFSETS,
      //     parameters: {
      //       depthTest: true,
      //     },
      //   },
      // },
      // {
      //   type: GeoJsonLayer,
      //   props: {
      //     id: 'city-model',
      //     data: 'http://localhost:9000/files/geojson/osm-malmo.json',
      //     opacity: 0.7,
      //     autoHighlight: true,
      //     material: 'material',
      //     onClick: d => {
      //       //this.setSelectedObject(d.object);
      //     },
      //     // onHover: (info) => {
      //     //   console.log(info);
      //     // },
      //     highlightColor: [100, 150, 250, 128],
      //     extruded: true,
      //     wireframe: true,
      //     filled: true,
      //     pickable: true,
      //     //coordinateSystem: COORDINATE_SYSTEM.METER_OFFSETS,
      //     getPolygon: d => d.geometry.coordinates,
      //     getFillColor: [200, 200, 220, 200],
      //     getLineColor: [100, 100, 100],
      //     getElevation: d => {
      //       return d.properties.height || 10;
      //     },
      //   },
      // },
      {
        type: SolidPolygonLayer,
        props: {
          id: 'city-model',
          data: 'http://localhost:9000/files/geojson/osm-malmo.json',
          opacity: 0.7,
          autoHighlight: true,
          material: 'material',
          onClick: d => {
            //this.setSelectedObject(d.object);
          },
          // onHover: (info) => {
          //   console.log(info);
          // },
          highlightColor: [100, 150, 250, 128],
          extruded: true,
          wireframe: true,
          filled: true,
          pickable: true,
          //coordinateSystem: COORDINATE_SYSTEM.METER_OFFSETS,
          getPolygon: d => d.geometry.coordinates,
          getFillColor: [200, 200, 220, 200],
          getLineColor: [100, 100, 100],
          getElevation: d => {
            return d.properties.height || 10;
          },
        },
      },
      // {
      //   type: TileLayer,
      //   props: {
      //     id: 'building-tiles',
      //     data: [],
      //   },
      // },
      // {
      //   type: Tile3DLayer,
      //   props: {
      //     id: 'tile-3d-layer',
      //     //data: 'http://localhost:9000/files/gltf/1.0/TilesetWithTreeBillboards/tileset.json',
      //     //data: 'http://localhost:9000/files/gltf/1.0/TilesetWithDiscreteLOD/tileset.json',
      //     data: 'http://localhost:9000/files/gltf/1.0/TilesetWithRequestVolume/tileset.json',
      //     //getPosition: [0, 0, 0],
      //     // override scenegraph subLayer prop
      //     // _subLayerProps: {
      //     //   scenegraph: { _lighting: 'flat' },
      //     // },
      //   },
      // },
      // {
      //   type: ScatterplotLayer,
      //   props: {
      //     id: 'test-layer',
      //     data: [
      //       {
      //         coordinates: [-75.61209429047926, 40.04253061601606],
      //       },
      //     ],
      //     pickable: true,
      //     opacity: 0.8,
      //     stroked: true,
      //     filled: true,
      //     radiusScale: 6,
      //     radiusMinPixels: 1,
      //     radiusMaxPixels: 100,
      //     lineWidthMinPixels: 1,
      //     getPosition: d => d.coordinates,
      //     getRadius: d => 10,
      //     getFillColor: d => [255, 140, 0],
      //     getLineColor: d => [0, 0, 0],
      //     //coordinateSystem: COORDINATE_SYSTEM.METER_OFFSETS,
      //   },
      // },
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
    const layerProps = this.layerGroups[0]?.layers[0]?.props;
    layerProps.data = value.features.filter(f => f.geometry.type === 'Polygon');
    this.updateLayers();
    return {};
  }
  getLayers() {
    return this.layerGroups.reduce((acc, group) => {
      return [...acc, ...group.layers];
    }, []);
  }
  getLayersInstances() {
    console.log('generate layers');
    const layers = this.getLayers();
    return layers.map(layer => {
      layer.props.onDataLoad = this.onDataLoad.bind(this);
      // layer.props.onTilesetLoad = tileset => {
      //   // ! use this to center around loaded tileset, obviously this can be both good or bad...
      //   // console.log(tileset);
      //   // const { cartographicCenter, zoom } = tileset;
      //   // this.rootStore.viewStore.setViewState({
      //   //   longitude: cartographicCenter[0],
      //   //   latitude: cartographicCenter[1],
      //   //   zoom,
      //   // });
      //   // this.rootStore.deck.redraw(true);
      // };
      // layer.props.onTileLoad = tile => {
      //   console.log(tile);
      // };
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
  debug: false,
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
    pitch: 0,
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
      console.log('viewstate change');
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
