// Copyright (C) 2022 Andreas Rudenå
// Licensed under the MIT License

import { Deck } from '@deck.gl/core';
import {
  JSONConverter,
  JSONConfiguration,
  _shallowEqualObjects,
} from '@deck.gl/json';
import { Feature } from 'geojson';
import maplibreGl from 'maplibre-gl';
import { tileToQuadkey } from '@mapbox/tilebelt';
import { City, cities } from '@dtcv/cities';
import { ViewStore } from './store/ViewStore.js';
import MaplibreWrapper from './utils/MaplibreWrapper.js';
import { toLngLat } from './utils/projection.js';
import JSON_CONVERTER_CONFIGURATION, {
  addUpdateTriggersForAccessors,
  JsonProps,
} from './config/converter-config.js';

type ViewerProps = any & {
  onLoad?: () => void;
  onSelectObject?: (object: any) => Feature | null;
  onDragEnd?: () => {
    longitude: number;
    latitude: number;
    zoom: number;
  };
};

// There is a performance problem for extruded polygons that does not appear in the maplibre rendering settings
// While figuring this out, maplibre is used to control the gl context and interaction
// This is NOT ideal since the bundle size increase dramatically
// todo: remove maplibre
class Viewer {
  gl: WebGL2RenderingContext | null = null;
  deck: Deck;
  jsonConverter: JSONConverter;
  viewStore: ViewStore;
  maplibreMap?: maplibregl.Map;
  selectedObject: Feature | null = null;
  selectedGraphObject: Feature | null = null;
  hoveredObject: Feature | null = null;
  hoveredGraphObject: Feature | null = null;
  currentCity: City | null = null;
  useMaplibre = false;
  props: ViewerProps;
  constructor(props: ViewerProps, maplibreOptions?: maplibregl.MapOptions) {
    this.jsonConverter = new JSONConverter({
      configuration: new JSONConfiguration(JSON_CONVERTER_CONFIGURATION),
    });
    this.viewStore = new ViewStore(this);

    const defaultProps = {
      debug: false,
      glOptions: {
        antialias: true,
        depth: true,
      },
      layers: [],
      useDevicePixels: true,
      getCursor: this.getCursor.bind(this),
    };

    const resolvedProps = Object.assign({}, defaultProps, props);
    this.props = resolvedProps;

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
  }

  get zoom() {
    return this.viewStore.zoom;
  }

  set zoom(zoom) {
    // this.viewStore.setViewState({ zoom });
    // this.render();
  }

  setCityFromId(cityId: string) {
    const city = cities.find(c => c.id === cityId);
    if (!city) {
      console.warn('city was not found by: ', cityId);
    }
    this.setCity(city);
  }

  setCity(city: City) {
    const currentCity = this.currentCity || { id: null };
    if (city.id !== currentCity.id) {
      if (this.maplibreMap) {
        console.log('set center', city);
        this.maplibreMap.setCenter([city.lng, city.lat]);
        this.setProps({
          layers: [],
        });
      } else {
        this.setProps({
          viewState: {
            // todo: refactor the viewStore, set the lng lat from city and keep the rest of the state
          },
          layers: [],
        });
      }
    }
    console.log('set city', city);
    this.currentCity = city;
  }

  getCity() {
    return this.currentCity;
  }

  getVisibleObjects(
    layerIds: string[],
    x?: number,
    y?: number,
    width?: number,
    height?: number
  ) {
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

  getCursor({ isDragging, isHovering }) {
    return isHovering ? 'pointer' : 'grab';
  }

  onWebGLInitialized(gl) {
    console.log('initialised');
    this.gl = gl;
  }

  onViewStateChange({ viewId, viewState }) {
    // this.viewStore.setViewState(viewState);
    // this.deck.setProps({
    //   views: this.viewStore.getViews(),
    //   viewState: this.viewStore.getViewState(),
    // });
    return viewState;
  }

  layerFilter = ({ layer, viewport }) => {
    return true;
  };

  setSelectedObject(object) {
    this.selectedObject = object;
    if (this.props.onSelectObject) {
      this.props.onSelectObject(object);
    }
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

  setActiveView(viewId: 'graph' | 'map') {
    this.viewStore.setActiveView(viewId);
  }

  setProps(props: ViewerProps) {
    if (this.useMaplibre) {
      this.deck.setProps({
        layers: props.layers,
      });
    } else {
      const viewProps = {
        views: props.views || this.viewStore.getViews(),
        viewState: props.viewState || this.viewStore.getViewState(),
      };
      this.deck.setProps({ ...props, ...viewProps });
    }
  }

  setJson(json: JsonProps) {
    if (!this.deck) {
      return;
    }

    addUpdateTriggersForAccessors(json);
    const props = this.jsonConverter.convert(json);

    console.log('props', props);

    this.setProps(props);
  }

  getQuadkey(x: number, y: number, z: number) {
    return tileToQuadkey([x, y, z]);
  }

  private maplibre(props) {
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
      zoom: props.zoom || props.zoom === 0 ? props.zoom : 14, // starting zoom
      minZoom: props.minZoom || props.minZoom === 0 ? props.minZoom : 10,
      pitch: props.pitch || props.pitch === 0 ? props.pitch : 60,
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
      if (!this.maplibreMap) {
        return;
      }
      if (props.onLoad) {
        props.onLoad();
      }
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
        }) as maplibregl.LayerSpecification
      );

      this.maplibreMap.on('move', () => {
        if (this.deck.props.onDrag) {
          const { lng, lat } = this.maplibreMap.getCenter();
          // this.deck.props.onDrag({
          //   longitude: lng,
          //   latitude: lat,
          // });
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
          const viewport = this.deck.viewManager.getViewport('mapview');
          const { zoom } = viewport;
          // this.deck.props.onDragEnd({
          //   longitude: lng,
          //   latitude: lat,
          //   zoom,
          // });
        }
        //this.viewStore.setViewStateEnd();
      });

      //this.render();
    });
  }
}

export { Viewer };
export type { ViewerProps };
