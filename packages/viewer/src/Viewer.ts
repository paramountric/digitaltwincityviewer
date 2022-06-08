// Copyright (C) 2022 Andreas Rudenå
// Licensed under the MIT License

import { Deck, MapViewState, MapView } from '@deck.gl/core';
import { Feature } from 'geojson';
import { LayerSpecification, Map, MapOptions } from 'maplibre-gl';
import { makeObservable, observable, action } from 'mobx';
import { LayerStore, UpdateLayerProps } from './store/LayerStore';
import { ViewStore } from './store/ViewStore';
import MaplibreWrapper from './utils/MaplibreWrapper';
import { toLngLat } from './utils/projection';
import { getCity, City } from './utils/getCity';

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

// internalProps = not to be set from parent component
const internalProps = {
  debug: false,
  viewState: null,
  container: null,
  glOptions: {
    antialias: true,
    depth: false,
  },
  layers: [],
  onWebGLInitialized: (): void => null,
  onViewStateChange: ({ viewState }) => viewState,
};

// There is a performance problem for extruded polygons that does not appear in the maplibre rendering settings
// While figuring this out, maplibre is used to control the gl context and interaction
// This is NOT ideal since the bundle size increase dramatically
// todo: remove maplibre
// ! note: the fast iterations have created three tracks on how the viewState works, however the code is kept in the repo for all of them -> if below is true, part of the other code is not used...
const useMaplibre = true;

type ViewerProps = {
  longitude?: number;
  latitude?: number;
  zoom?: number;
  container?: HTMLElement | string;
};
class Viewer {
  gl: WebGL2RenderingContext;
  deck: Deck;
  viewStore: ViewStore;
  layerStore: LayerStore;
  maplibreMap?: Map;
  selectedObject: Feature | null;
  currentCity: City;
  constructor(props: ViewerProps) {
    this.viewStore = new ViewStore(this);
    this.layerStore = new LayerStore(this);

    const resolvedProps = Object.assign({}, internalProps, props);

    if (useMaplibre) {
      this.maplibre(resolvedProps);
    } else {
      resolvedProps.onWebGLInitialized = this.onWebGLInitialized.bind(this);
      resolvedProps.onViewStateChange = this.onViewStateChange.bind(this);
      resolvedProps.viewState = this.viewStore.getViewState();
      this.deck = new Deck(resolvedProps);
    }
    this.viewStore.setViewState(props);

    this.setSelectedObject(null);

    makeObservable(this, {
      selectedObject: observable,
      setSelectedObject: action,
    });
  }

  get zoom() {
    return this.viewStore.zoom;
  }

  set zoom(zoom) {
    this.viewStore.setViewState({ zoom });
    this.render();
  }

  getVisibleObjects(
    layerIds: string[],
    x: number,
    y: number,
    width: number,
    height: number
  ) {
    const viewport = this.deck.viewManager.getViewport('mapview');
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
    this.selectedObject = object;
  }

  setLayerProps(layerId: string, props) {
    this.layerStore.setLayerProps(layerId, props);
  }

  setCenter(webmercatorCenter) {
    if (useMaplibre) {
      const lngLatCenter = toLngLat(webmercatorCenter[0], webmercatorCenter[1]);
      this.maplibreMap.setCenter(lngLatCenter);
    } else {
      this.viewStore.setCenter(webmercatorCenter);
    }
  }

  setLayerState(layerId: string, state) {
    this.layerStore.setLayerState(layerId, state);
  }

  setLayerStyle(layerId: string, style) {
    this.layerStore.setLayerStyle(layerId, style);
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
  }

  unload() {
    this.layerStore.unload();
  }

  render() {
    const props = this.getProps();
    this.deck.setProps(props);
  }

  private maplibre(props) {
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
        // this.deck.setProps({
        //   viewState: {
        //     longitude: lng,
        //     latitude: lat,
        //     zoom: this.maplibreMap.getZoom(),
        //     bearing: this.maplibreMap.getBearing(),
        //     pitch: this.maplibreMap.getPitch(),
        //   },
        // });
        this.viewStore.setViewState({
          longitude: lng,
          latitude: lat,
          zoom: this.maplibreMap.getZoom(),
          // bearing: this.maplibreMap.getBearing(),
          // pitch: this.maplibreMap.getPitch(),
        });
        // Prevent deck from redrawing - repaint is driven by maplibre's render loop
        this.deck.needsRedraw({ clearRedrawFlags: true });
      });

      this.maplibreMap.on('moveend', () => {
        this.viewStore.setViewStateEnd();
      });

      this.render();
    });
  }
}

export { Viewer, ViewerProps };
