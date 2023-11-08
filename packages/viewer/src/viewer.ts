import {
  Deck,
  DeckProps,
  MapView,
  MapViewState,
  FilterContext,
  LinearInterpolator,
} from '@deck.gl/core/typed';
import GL from '@luma.gl/constants';
import { ViewStateChangeParameters } from '@deck.gl/core/typed/controllers/controller';
import EventSource from './event-source';
import { ViewerProps, defaultViewerProps } from './viewer-props';
import { FeatureManager } from './feature-manager';

export class Viewer extends EventSource {
  props: ViewerProps;
  deck: Deck;
  canvas?: HTMLCanvasElement;
  interactionManager: any;
  constructor(viewportProps: ViewerProps) {
    super();
    const resolvedProps = Object.assign(
      {
        width: window.innerWidth,
        height: window.innerHeight,
      },
      defaultViewerProps,
      viewportProps,
      {
        onLoad: this.onLoad.bind(this),
        // onResize: this.onResize.bind(this),
        getCursor: this.getCursor.bind(this),
        getTooltip: () => null,
      }
    ) as DeckProps;
    this.props = resolvedProps as ViewerProps;
    this.deck = new Deck(resolvedProps);

    this.onViewStateChange = this.onViewStateChange.bind(this);
    this.layerFilter = this.layerFilter.bind(this);
    this.onInteractionStateChange = this.onInteractionStateChange.bind(this);
  }

  onLoad() {
    // @ts-ignore
    const { gl } = this.deck.deckRenderer;
    // @ts-ignore
    this.canvas = this.deck.canvas;

    if (!this.canvas) {
      throw new Error('No canvas');
    }

    this.canvas.addEventListener(
      'mousemove',
      this.interactionManager.onMouseMove
    );
    this.canvas.addEventListener(
      'mousedown',
      this.interactionManager.onMouseDown
    );
    this.canvas.addEventListener('mouseup', this.interactionManager.onMouseUp);
    this.canvas.addEventListener(
      'mouseout',
      this.interactionManager.onMouseOut
    );
    console.log('init events');
    this.canvas.addEventListener('dragover', (e: any) => {
      e.preventDefault();
    });
    this.canvas.addEventListener('drop', (e: any) => {
      e.preventDefault();
      if (e.dataTransfer?.files?.length > 0) {
        const file = e.dataTransfer.files[0];
        const fileName = file.name;
        const fileType = fileName.split('.').pop().toLowerCase();
        const reader = new FileReader();
        // create capital letter on the fileType:
        const fileTypeCapitalized =
          fileType.charAt(0).toUpperCase() + fileType.slice(1);
        let fileTypeType = `${fileTypeCapitalized}File`;

        reader.onload = () => {
          const fileContent = reader.result;
          // todo: continue with file content
        };
        reader.readAsArrayBuffer(file);
      }
    });
    this._update();
  }

  getCursor(info: any) {
    return this.interactionManager.getCursor(info);
  }

  getProps(overrideProps?: any): ViewerProps & DeckProps {
    const { flyTo } = overrideProps || {};
    return {
      ...this.props,
      parameters: {
        blend: true,
        blendFunc: [
          GL.SRC_ALPHA,
          GL.ONE_MINUS_SRC_ALPHA,
          GL.ONE,
          GL.ONE_MINUS_SRC_ALPHA,
        ],
        polygonOffsetFill: true,
        depthTest: true,
        depthFunc: GL.LEQUAL,
        // clearColor: [1, 1, 1, 1],
        clearColor: [249 / 256, 246 / 256, 243 / 256, 1],
        // clearColor: [206 / 256, 197 / 256, 192 / 256, 1],
      },
      width: this.props.width,
      height: this.props.height,
      viewState: this.getViewStates(flyTo),
      views: this.getViews(),
      onViewStateChange: this.onViewStateChange,
      onInteractionStateChange: this.onInteractionStateChange,
      layerFilter: this.layerFilter,
      layers: this.getLayers(),
      effects: [],
    };
  }

  getViewStates(flyTo?: MapViewState) {
    const viewStates = {
      main: flyTo
        ? flyTo
        : ({
            longitude: this.props.longitude,
            latitude: this.props.latitude,
            zoom: this.props.zoom,
            pitch: this.props.pitch,
            bearing: this.props.bearing,
            position: this.props.position,
            minZoom: this.props.minZoom,
            maxZoom: this.props.maxZoom,
          } as MapViewState),
    };
    return viewStates;
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

  onViewStateChange({
    viewState,
    viewId,
    interactionState,
    oldViewState,
  }: ViewStateChangeParameters & { viewId: string }) {
    if (!this.deck) {
      return;
    }
    this._update();
  }

  onInteractionStateChange(interactionState: any) {
    this.interactionManager.onInteractionStateChange(interactionState);
  }

  layerFilter({ layer, viewport }: FilterContext) {
    return true;
  }

  getLayers() {
    return []; //getViewportLayers(this);
  }

  _update(overrideProps?: any) {
    this.deck.setProps(this.getProps(overrideProps));
  }

  pixelToCartesian(x: number, y: number): number[] | null {
    const viewport = this.deck?.getViewports().find(v => v.id === 'main');
    if (!viewport) {
      return null;
    }
    return viewport.unproject([x, y]);
  }

  getLayerById(layerId: string) {
    // @ts-ignore
    const layers = this.deck.layerManager.getLayers();
    return layers.find(l => l.id === layerId);
  }

  flyTo(
    {
      longitude,
      latitude,
      zoom,
      bearing = 0,
      pitch = 0,
      position = [0, 0],
    }: MapViewState,
    around?: number[] // pixelX, pixelY
  ) {
    this._update({
      flyTo: {
        longitude,
        latitude,
        zoom,
        bearing,
        pitch,
        position,
        transitionDuration: 800,
        // transisionInterpolator: new ZoomToNodeInterpolator(),
        transitionInterpolator: new LinearInterpolator({
          transitionProps: ['target', 'zoom', 'rotationX', 'rotationOrbit'],
          around,
        }),
        // transitionEasing: cubicIn,
        onTransitionEnd: () => {
          this.emit('fly-to-end', {});
        },
        onTransitionStart: () => {
          this.emit('fly-to-start', {});
        },
        onTransitionInterrupt: () => {
          this.emit('fly-to-interrupt', {});
        },
      },
    });
  }
}
