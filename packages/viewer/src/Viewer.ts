import {
  Deck,
  DeckProps,
  FilterContext,
  MapView,
  Layer,
} from '@deck.gl/core/typed';
import { JSONConverter, JSONConfiguration } from '@deck.gl/json/typed';
import maplibreGl from 'maplibre-gl';
import { ViewerProps, getJsonConfig, setProps } from './viewer-props';
import {
  getDefaultViewerProps,
  getDefaultMaplibreOptions,
} from './default-viewer-props-config';
import MaplibreLayer from './utils/maplibre-layer';
import { IconLayer, ScatterplotLayer, ArcLayer } from '@deck.gl/layers/typed';

export class Viewer {
  gl: WebGLRenderingContext | null = null;
  deck?: Deck; // deck will be undefined until load, but always set
  props: ViewerProps;
  jsonConverter: JSONConverter;
  maplibreMap?: maplibregl.Map;
  iconLayer?: MaplibreLayer<IconLayer>;
  // the cursor can be controlled this way, not sure if this is the best way
  public cursor: string | null = null;
  constructor(props: ViewerProps, maplibreOptions?: maplibregl.MapOptions) {
    const jsonConfig = getJsonConfig(props);
    console.log(jsonConfig);
    this.jsonConverter = new JSONConverter({
      configuration: new JSONConfiguration(jsonConfig),
    });

    const parsedProps = props; // this.jsonConverter.convert(props);

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
    if (this.maplibreMap) {
      console.log('get props for maplibre');
      return {
        layers: this.getLayers(),
      };
    } else {
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
  }

  setProps(props: ViewerProps) {
    const parsedProps = this.jsonConverter.convert(props);
    // todo: figure out helper functions for other props
    // const needsUpdate = setProps(this, parsedProps);
    this.props = parsedProps;
    // if (needsUpdate) {

    if (this.maplibreMap) {
      const layers = this.getLayers();

      for (const layer of layers) {
        console.log(layer);
        // const layerProps = Object.assign({}, layer.props};
        // layerProps.type = layer.constructor;
        this.maplibreMap.addLayer(
          layer
          // new MaplibreLayer<IconLayer>({
          //   ...layer.props,
          //   type: layer.constructor,
          // })
        );
      }
    } else {
      this._update();
    }
    return props;
  }

  setIconLayerProps(props: any) {
    if (!this.maplibreMap) {
      return;
    }
    if (!this.iconLayer) {
      props.type = IconLayer;
      this.iconLayer = new MaplibreLayer<IconLayer>(props);
      this.maplibreMap.addLayer(this.iconLayer);
    } else {
      this.iconLayer.setProps(props);
    }
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
    const layerInstances = this.props.layers?.filter(l => l instanceof Layer);
    // todo: add layers from other config objects if any
    return layerInstances || [];
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
      // const gl = this.maplibreMap.painter.context.gl;
      // this.deck = new Deck(
      //   Object.assign({
      //     gl,
      //   })
      // );

      // this.maplibreMap.addLayer(
      //   new MaplibreLayer({
      //     id: 'viewer',
      //     deck: this.deck,
      //   })
      // );

      // console.log(maplibreOptions.center);

      // this.maplibreMap.addLayer(
      //   new MaplibreLayer({
      //     id: 'deckgl-circle',
      //     type: ScatterplotLayer,
      //     data: [
      //       {
      //         position: maplibreOptions.center,
      //         color: [255, 0, 0],
      //         radius: 1000,
      //       },
      //     ],
      //     getPosition: (d: any) => d.position,
      //     getFillColor: (d: any) => d.color,
      //     getRadius: (d: any) => d.radius,
      //     opacity: 0.3,
      //   })
      // );

      // this.maplibreMap.addLayer(
      //   new MaplibreLayer<IconLayer>({
      //     id: 'icons',
      //     type: IconLayer,
      //     data: [
      //       {
      //         coordinates: maplibreOptions.center,
      //       },
      //     ],
      //     iconAtlas:
      //       'https://raw.githubusercontent.com/visgl/deck.gl-data/master/website/icon-atlas.png',
      //     iconMapping: {
      //       marker: { x: 0, y: 0, width: 128, height: 128, mask: true },
      //     },
      //     getIcon: (d: any) => 'marker',
      //     sizeScale: 15,
      //     getPosition: (d: any) => d.coordinates,
      //     getSize: (d: any) => 5,
      //     getColor: (d: any) => [Math.sqrt(d.exits), 140, 0],
      //   })
      // );

      // this.maplibreMap.addLayer(
      //   new MaplibreLayer({
      //     id: 'deckgl-arc',
      //     type: ArcLayer,
      //     data: [
      //       {
      //         source: maplibreOptions.center,
      //         target: [-122.400068, 37.7900503],
      //       },
      //     ],
      //     getSourcePosition: d => d.source,
      //     getTargetPosition: d => d.target,
      //     getSourceColor: [255, 208, 0],
      //     getTargetColor: [0, 128, 255],
      //     getWidth: 8,
      //   })
      // );

      if (this.props.onLoad) {
        this.props.onLoad(this);
      }
    });
  }
}
