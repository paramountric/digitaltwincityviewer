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
    depth: true,
  },
  layers: [],
  onWebGLInitialized: (): void => null,
  onViewStateChange: ({ viewState }) => viewState,
  layerFilter: ({ viewport, layer }) => true,
};

// There is a performance problem for extruded polygons that does not appear in the maplibre rendering settings
// While figuring this out, maplibre is used to control the gl context and interaction
// This is NOT ideal since the bundle size increase dramatically
// todo: remove maplibre
// ! note: the fast iterations have created three tracks on how the viewState works, however the code is kept in the repo for all of them -> if below is true, part of the other code is not used...
const useMaplibre = false;

type ViewerProps = {
  longitude?: number;
  latitude?: number;
  zoom?: number;
  container?: HTMLElement | string;
  bearing?: number;
  pitch?: number;
};
class Viewer {
  gl: WebGL2RenderingContext;
  deck: Deck;
  viewStore: ViewStore;
  layerStore: LayerStore;
  maplibreMap?: Map;
  selectedObject: Feature | null = null;
  selectedGraphObject: Feature | null = null;
  hoveredObject: Feature | null = null;
  hoveredGraphObject: Feature | null = null;
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
      resolvedProps.layerFilter = this.layerFilter.bind(this);
      resolvedProps.viewState = this.viewStore.getViewState();
      this.deck = new Deck(resolvedProps);
    }
    this.viewStore.setViewState(props);

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

  onViewStateChange({ viewId, viewState }) {
    if (viewId === 'graphview') {
      this.viewStore.setGraphState(viewState);
    } else {
      this.viewStore.setViewState(viewState);
    }
    this.deck.setProps({
      views: this.viewStore.getViews(),
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
    if (useMaplibre) {
      return {
        layers: this.layerStore.getLayersInstances(),
      };
    }
    return {
      layers: this.layerStore.getLayersInstances(),
      views: this.viewStore.getViews(),
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
    if (useMaplibre) {
      this.maplibreMap.setCenter(lngLatCenter);
    } else {
      this.viewStore.setCenter(lngLatCenter);
    }
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
  }

  unload() {
    this.layerStore.unload();
  }

  render() {
    if (!this.deck) {
      return;
    }
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
