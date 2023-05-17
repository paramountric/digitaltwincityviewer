import { Deck, DeckProps, FilterContext, MapView } from '@deck.gl/core/typed';
import { JSONConverter, JSONConfiguration } from '@deck.gl/json/typed';
import maplibreGl from 'maplibre-gl';
import { ViewerProps, getJsonConfig, setProps } from './viewer-props';
import {
  getDefaultViewerProps,
  getDefaultMaplibreOptions,
} from './default-viewer-props-config';
import MaplibreWrapper from './utils/MaplibreWrapper.js';

export class Viewer {
  gl: WebGLRenderingContext | null = null;
  deck?: Deck; // deck will be undefined until load, but always set
  props: ViewerProps;
  jsonConverter: JSONConverter;
  maplibreMap?: maplibregl.Map;
  // the cursor can be controlled this way, not sure if this is the best way
  public cursor: string | null = null;
  constructor(props: ViewerProps, maplibreOptions?: maplibregl.MapOptions) {
    this.jsonConverter = new JSONConverter({
      configuration: new JSONConfiguration(getJsonConfig(props)),
    });

    const parsedProps = this.jsonConverter.convert(props);

    const resolvedProps: ViewerProps = Object.assign(
      {},
      getDefaultViewerProps(this),
      parsedProps
    );

    this.props = resolvedProps;

    if (maplibreOptions) {
      // note the order of props here -> defaultMaplibre, viewerProps, maplibreOptions (viewerProps could be overwritten by mapblibreOptions where the settings overlap)
      this.useMaplibre(
        Object.assign({}, getDefaultMaplibreOptions(props), maplibreOptions)
      );
    } else {
      // note: the viewer props is directly passed to deck to allow for convenient mapping
      // however this might not be the best way as the ViewerProps are an abstraction layer on top of DeckProps
      // after init, the getProps method is used which is selective, so some props will only be set here on init (or later added explicitly to getProps...)
      this.deck = new Deck(this.props as DeckProps);
    }
  }

  getProps(): DeckProps {
    return {
      viewState: this.getViewStates(),
      views: this.getViews(),
      onViewStateChange: this.onViewStateChange.bind(this),
      onInteractionStateChange: this.onInteractionStateChange.bind(this),
      onWebGLInitialized: this.onWebGLInitialized.bind(this),
      layerFilter: this.layerFilter.bind(this),
      layers: this.getLayers(),
    };
  }

  setProps(props: ViewerProps) {
    const parsedProps = this.jsonConverter.convert(props);
    const needsUpdate = setProps(this, parsedProps);
    this.props = props;
    console.log('props', props);
    if (needsUpdate) {
      this._update();
    }
    return props;
  }

  getViews() {
    return [
      new MapView({
        id: 'main',
        controller: { dragMode: 'pan', dragPan: true, inertia: false },
        width: this.props.width,
        height: this.props.height,
        near: 0.01,
      } as any),
    ];
  }

  getViewStates() {
    return {
      main: Object.assign({
        // target: this.props.target,
        // zoom: this.props.zoom,
        // rotationX: this.props.rotationX,
        // rotationOrbit: this.props.rotationOrbit,
        // minZoom: this.props.minZoom,
        // maxZoom: this.props.maxZoom,
      }),
    };
  }

  _update() {
    if (!this.deck) {
      return;
    }
    this.deck.setProps(this.getProps());
  }

  onViewStateChange({
    viewState,
    viewId,
    interactionState,
    oldViewState,
  }: any) {
    if (!this.deck) {
      return;
    }

    if (viewId === 'main') {
      this.props = { ...this.props, ...viewState };
    }

    this._update();
  }

  onInteractionStateChange(extra: any) {
    if (!extra.isDragging) {
      //console.log('now it is time to update the queried data');
    }
  }

  layerFilter({ layer, viewport }: FilterContext) {
    if (viewport.id === 'main') {
      if (layer.id.startsWith('node-viewer')) {
        return false;
      }
      return true;
    } else if (
      viewport.id.startsWith('node-viewer') &&
      layer.id.startsWith(viewport.id)
    ) {
      return true;
    }
    return false;
  }

  onWebGLInitialized(gl: WebGLRenderingContext) {
    this.gl = gl;
  }

  getLayers() {
    // todo: this have to sync with the json config so that the concepts of specifying layers and abstraction options can be combined
    return [];
  }

  getCursor({ isDragging, isHovering }: any) {
    if (isHovering) {
      return 'pointer';
    }
    return this.cursor || 'grab';
  }

  private useMaplibre(maplibreOptions: maplibregl.MapOptions) {
    // todo: should this be configurable?
    const CONTAINER_ID = 'viewport';
    // during dev hot reload in react this is to prevent the maplibre-gl from being loaded multiple times
    const existingContainer = document.getElementById(CONTAINER_ID);
    if (existingContainer && existingContainer.hasChildNodes()) {
      existingContainer.innerHTML = '';
    }

    if (!maplibreOptions.container) {
      const container = document.createElement('div');
      container.setAttribute('id', CONTAINER_ID);
      container.style.width = '100%'; //window.innerWidth;
      container.style.height = '100%'; //window.innerHeight;
      container.style.position = 'absolute';
      container.style.top = '0px';
      container.style.left = '0px';
      container.style.background = '#100';
      document.body.appendChild(container);
      maplibreOptions.container = container;
    }

    console.log('mablibre options', maplibreOptions);

    this.maplibreMap = new maplibreGl.Map(maplibreOptions);

    this.maplibreMap.on('load', () => {
      // ts issue
      if (!this.maplibreMap) {
        return;
      }
      const gl = this.maplibreMap.painter.context.gl;
      this.deck = new Deck(
        Object.assign({
          gl,
        })
      );

      this.maplibreMap.addLayer(
        new MaplibreWrapper({
          id: 'viewer',
          deck: this.deck,
        }) as maplibregl.LayerSpecification
      );

      if (this.props.onLoad) {
        this.props.onLoad(this);
      }
    });
  }
}
