import {
  Deck,
  DeckProps,
  OrbitView,
  FilterContext,
  MapView,
} from '@deck.gl/core/typed';
import { JSONConverter, JSONConfiguration } from '@deck.gl/json/typed';
import maplibreGl from 'maplibre-gl';
import { ViewerProps, getJsonConfig, setProps } from './viewer-props';
import MaplibreWrapper from './utils/MaplibreWrapper.js';

export class Viewer {
  gl: WebGL2RenderingContext | null = null;
  deck: Deck;
  props: ViewerProps;
  jsonConverter: JSONConverter;
  constructor(props: ViewerProps, maplibreOptions?: maplibregl.MapOptions) {
    this.jsonConverter = new JSONConverter({
      configuration: new JSONConfiguration(getJsonConfig(props)),
    });

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
  }

  getProps(): DeckProps {
    return {
      viewState: this.getViewStates(),
      views: this.getViews(),
      onViewStateChange: this.onViewStateChange.bind(this),
      onInteractionStateChange: this.onInteractionStateChange.bind(this),
      layerFilter: this.layerFilter.bind(this),
      layers: this.getLayers(),
    };
  }

  setProps(props: ViewerProps) {
    const needsUpdate = setProps(this, props);
    if (needsUpdate) {
      this._update();
    }
  }

  getViews() {
    return [
      new MapView({
        id: 'main',
        controller: { dragMode: 'pan', dragPan: true, inertia: false },
        width: this.props.width,
        height: this.props.height,
        orthographic: this.props.orthographic || false,
        near: 0.01,
      } as any),
    ];
  }

  getViewStates() {
    return {
      main: Object.assign({
        target: this.props.target,
        zoom: this.props.zoom,
        rotationX: this.props.rotationX,
        rotationOrbit: this.props.rotationOrbit,
        minZoom: this.props.minZoom,
        maxZoom: this.props.maxZoom,
      }),
    };
  }

  _update() {
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

  onWebGLInitialized(gl) {
    this.gl = gl;
  }

  getLayers() {
    // todo: this have to sync with the json config so that the concepts of specifying layers and abstraction options can be combined
    return [];
  }
}
