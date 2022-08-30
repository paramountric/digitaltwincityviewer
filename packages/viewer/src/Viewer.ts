// Copyright (C) 2022 Andreas Rudenå
// Licensed under the MIT License

import { Deck, DeckProps, MapViewState, MapView } from '@deck.gl/core';
import {
  JSONConverter,
  JSONConfiguration,
  _shallowEqualObjects,
} from '@deck.gl/json';
import { Feature } from 'geojson';
import maplibreGl from 'maplibre-gl';
import { makeObservable, observable, action } from 'mobx';
import { tileToQuadkey } from '@mapbox/tilebelt';
import { LayerStore, UpdateLayerProps } from './store/LayerStore.js';
import { ViewStore } from './store/ViewStore.js';
import MaplibreWrapper from './utils/MaplibreWrapper.js';
import { toLngLat } from './utils/projection.js';
import { getCity, City } from './utils/getCity.js';
import JSON_CONVERTER_CONFIGURATION, {
  addUpdateTriggersForAccessors,
} from './config/converter-config.js';
import Tile3DLayer from './layers/tile-3d-layer/tile-3d-layer.js';

// internalProps = not to be set from parent component
const internalProps = {
  debug: false,
  glOptions: {
    antialias: true,
    depth: true,
  },
  layers: [],
  // onWebGLInitialized: null,
  // onViewStateChange: null,
  // layerFilter: null,
};

// There is a performance problem for extruded polygons that does not appear in the maplibre rendering settings
// While figuring this out, maplibre is used to control the gl context and interaction
// This is NOT ideal since the bundle size increase dramatically
// todo: remove maplibre
// ! note: the fast iterations have created three tracks on how the viewState works, however the code is kept in the repo for all of them -> if below is true, part of the other code is not used...
// ! second note: the recent developments goes towards using Deck, thus using the existing state of Deck would be advantageous (instead of managing state in this component)
// const useMaplibre = true; // this is now sent in as second param in constructor

// todo: refactor this -> now the Deck props are used directly which means that this is getting more and more a wrapper around Deck
// type ViewerProps = {
//   longitude?: number;
//   latitude?: number;
//   zoom?: number;
//   canvas?: HTMLCanvasElement;
//   container?: HTMLElement | string; // maplibre
//   bearing?: number;
//   pitch?: number;
//   width?: number;
//   height?: number;
//   onLoad?: () => void;
// };
class Viewer {
  gl: WebGL2RenderingContext | null = null;
  deck: Deck;
  jsonConverter: JSONConverter;
  viewStore: ViewStore;
  layerStore: LayerStore;
  maplibreMap?: maplibregl.Map;
  selectedObject: Feature | null = null;
  selectedGraphObject: Feature | null = null;
  hoveredObject: Feature | null = null;
  hoveredGraphObject: Feature | null = null;
  currentCity: City | null = null;
  useMaplibre = false;
  constructor(props: DeckProps, maplibreOptions?: maplibregl.MapOptions) {
    this.jsonConverter = new JSONConverter({
      configuration: new JSONConfiguration(JSON_CONVERTER_CONFIGURATION),
    });
    this.viewStore = new ViewStore(this);
    this.layerStore = new LayerStore(this);

    const resolvedProps = Object.assign({}, internalProps, props);

    if (maplibreOptions) {
      this.useMaplibre = true;
      this.maplibre(Object.assign({}, resolvedProps, maplibreOptions));
    } else {
      resolvedProps.onWebGLInitialized = this.onWebGLInitialized.bind(this);
      resolvedProps.onViewStateChange = this.onViewStateChange.bind(this);
      resolvedProps.layerFilter = this.layerFilter.bind(this);
      this.deck = new Deck(resolvedProps);
    }
    //this.viewStore.setViewState(props);

    makeObservable(this, {
      selectedObject: observable,
      setSelectedObject: action,
    });
  }

  // onTilesetLoad(tileset) {
  //   console.log(tileset);
  // }

  // onTileLoad(tile) {
  //   console.log(tile);
  // }

  get zoom() {
    return this.viewStore.zoom;
  }

  set zoom(zoom) {
    this.viewStore.setViewState({ zoom });
    this.render();
  }

  // todo: determine the most convenient way to set the current city, enumeration?
  setCity(city: City) {
    this.currentCity = city;
  }

  getVisibleObjects(
    layerIds: string[],
    x?: number,
    y?: number,
    width?: number,
    height?: number
  ) {
    console.log(this.deck);

    if (!this.deck || !this.deck.viewManager) {
      return;
    }
    const viewport =
      this.deck.viewManager.getViewport('mapview') ||
      this.deck.viewManager.getViewport('default-view');
    const {
      x: defaultX,
      y: defaultY,
      width: defaultWidth,
      height: defaultHeight,
    } = viewport;
    return this.deck.pickObjects({
      x: x || defaultX,
      y: y || defaultY,
      width: width || defaultWidth,
      height: height || defaultHeight,
      layerIds,
    });
  }

  onWebGLInitialized(gl) {
    this.gl = gl;
    this.layerStore.renderLayers();
  }

  onViewStateChange({ viewId, viewState }) {
    if (viewId === 'graphview') {
      this.viewStore.setGraphState(viewState);
    } else {
      this.viewStore.setViewState(viewState);
    }
    this.deck.setProps({
      views: this.viewStore.getViews(),
      viewState: this.viewStore.getViewStates(),
    });
  }

  layerFilter = ({ layer, viewport }) => {
    if (viewport.id === 'mapview' && layer.id !== 'graph-layer') {
      return true;
    } else if (viewport.id === 'graphview' && layer.id === 'graph-layer') {
      return true;
    }
    return false;
  };

  getProps() {
    if (this.useMaplibre) {
      return {
        layers: this.layerStore.getLayersInstances(),
      };
    }
    return {
      layers: this.layerStore.getLayersInstances(),
      views: this.viewStore.getViews(),
      viewState: this.viewStore.getViewStates(),
    };
  }

  setSelectedObject(object) {
    this.selectedObject = object;
  }

  setSelectedGraphObject(object) {
    this.selectedGraphObject = object;
  }

  setHoveredObject(object) {
    this.hoveredObject = object;
  }

  setHoveredGraphObject(object) {
    this.hoveredGraphObject = object;
    this.deck.setProps({
      views: this.viewStore.getViews(),
    });
  }

  setLayerProps(layerId: string, props) {
    this.layerStore.setLayerProps(layerId, props);
  }

  getLayerData(layerId: string) {
    return this.layerStore.getLayerData(layerId);
  }

  // note: confusing, but due to artifacts when center on real webmercator, the center here is the offset relative to the city center
  // (it means that the viewer camera is 0,0 at city center at start which is a epsg3857 coordinate from getCity function, and here moved to the area of interest with an offset)
  setCenter(webmercatorCenter) {
    const lngLatCenter = toLngLat(webmercatorCenter[0], webmercatorCenter[1]);
    if (this.useMaplibre && this.maplibreMap) {
      this.maplibreMap.setCenter(lngLatCenter);
    } else {
      this.viewStore.setCenter(lngLatCenter);
    }
    this.deck.setProps({
      views: this.viewStore.getViews(),
    });
  }

  setLayerState(layerId: string, state) {
    this.layerStore.setLayerState(layerId, state);
  }

  setLayerStyle(layerId: string, style) {
    this.layerStore.setLayerStyle(layerId, style);
  }

  setActiveView(viewId: 'graph' | 'map') {
    this.viewStore.setActiveView(viewId);
  }

  public updateLayer(updateData: UpdateLayerProps) {
    const { layerId } = updateData;
    if (updateData.props) {
      this.setLayerProps(layerId, updateData.props);
    }
    if (updateData.state) {
      // set isLoaded to true by default
      if (updateData.state.isLoaded !== false) {
        updateData.state.isLoaded = true;
      }
      this.setLayerState(layerId, updateData.state);
    }
    if (updateData.style) {
      this.setLayerStyle(layerId, updateData.style);
    }
    if (layerId === 'graph-layer') {
      this.viewStore.setShowGraphView(true);
      this.viewStore.setActiveView('graph');
    }
    this.render();
  }

  unload() {
    this.layerStore.unload();
  }

  setJson(json) {
    if (!this.deck) {
      return;
    }

    addUpdateTriggersForAccessors(json);
    const props = this.jsonConverter.convert(json);
    // todo: need to customize jsonConverter for callbacks

    if (this.useMaplibre) {
      console.log('set layer deta', props.layers);
      this.deck.setProps({
        layers: props.layers,
      });
    } else {
      this.deck.setProps(props);
    }
  }

  getQuadkey(x: number, y: number, z: number) {
    return tileToQuadkey([x, y, z]);
  }

  render() {
    // todo: refactor out the extra state management
    if (!this.deck) {
      return;
    }
    const props = this.getProps();
    this.deck.setProps(props);
  }

  private maplibre(props) {
    console.log('props maplibre', props);
    const maplibreOptions = {
      container: 'canvas',
      accessToken: 'wtf',
      renderWorldCopies: false,
      antialias: true,
      style: {
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
      },
      center: [props.longitude || 0, props.latitude || 0],
      zoom: props.zoom || 14, // starting zoom
      minZoom: props.minZoom || 10,
      pitch: props.pitch || 60,
      attributionControl: false,
    } as maplibregl.MapOptions;
    if (props.container) {
      maplibreOptions.container = props.container;
    } else {
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
    }

    this.maplibreMap = new maplibreGl.Map(maplibreOptions);

    this.maplibreMap.on('load', () => {
      // how to fix this TS issue now again.. of course it's not undefined in here
      if (!this.maplibreMap) {
        return;
      }
      const gl = this.maplibreMap.painter.context.gl;
      this.deck = new Deck(
        Object.assign(props, {
          gl,
        })
      );

      console.log('set deck');

      this.maplibreMap.addLayer(
        new MaplibreWrapper({
          id: 'viewer',
          deck: this.deck,
        }) as maplibregl.LayerSpecification
      );

      this.maplibreMap.on('move', () => {
        if (this.deck.props.onDrag) {
          const { lng, lat } = this.maplibreMap.getCenter();
          this.deck.props.onDrag({
            longitude: lng,
            latitude: lat,
          });
        }
        // this.deck.setProps({
        //   viewState: {
        //     longitude: lng,
        //     latitude: lat,
        //     zoom: this.maplibreMap.getZoom(),
        //     bearing: this.maplibreMap.getBearing(),
        //     pitch: this.maplibreMap.getPitch(),
        //   },
        // });
        // this.viewStore.setViewState({
        //   longitude: lng,
        //   latitude: lat,
        //   zoom: this.maplibreMap.getZoom(),
        //   // bearing: this.maplibreMap.getBearing(),
        //   // pitch: this.maplibreMap.getPitch(),
        // });
        // Prevent deck from redrawing - repaint is driven by maplibre's render loop
        this.deck.needsRedraw({ clearRedrawFlags: true });
      });

      this.maplibreMap.on('moveend', () => {
        if (this.deck.props.onDragEnd) {
          const { lng, lat } = this.maplibreMap.getCenter();
          this.deck.props.onDragEnd({
            longitude: lng,
            latitude: lat,
          });
        }
        //this.viewStore.setViewStateEnd();
      });

      this.render();
    });
  }
}

// todo: refactor this -> now the Deck props are used directly which means that this is getting more and more a wrapper around Deck
export { Viewer }; // ViewerProps };
