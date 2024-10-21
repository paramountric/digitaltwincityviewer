import { Deck, Layer, DeckProps, FilterContext } from '@deck.gl/core/typed';
import { ViewStateChangeParameters } from '@deck.gl/core/typed/controllers/controller';
import GL from '@luma.gl/constants';
import { ViewportProps } from './types';
import { Timeline } from './lib/timeline';
import { MainLayout } from './layouts/main-layout';
import {
  DEFAULT_MAP_COORDINATES,
  DEFAULT_MAP_ZOOM,
  DEFAULT_MIN_ZOOM,
  DEFAULT_MAX_ZOOM,
  DEFAULT_BEARING,
  DEFAULT_PITCH,
  DEFAULT_BACKGROUND_COLOR,
} from './constants';
import { Feature } from './feature';

type Layout = any;
type UpdateTriggers = any;

export class Viewport {
  props: ViewportProps;
  deck: Deck | null;
  mainLayout: Layout;
  featureLayouts: Map<string, Layout> = new Map();
  timeline: Timeline;
  mainFeature: Feature;
  constructor(viewportProps: ViewportProps) {
    this.props = viewportProps;
    const {
      mainFeature = {
        id: 'main',
        key: 'main',
        properties: {},
      },
      width,
      height,
    } = viewportProps;

    mainFeature.properties._width = width;
    mainFeature.properties._height = height;
    mainFeature.properties._longitude =
      mainFeature.properties._longitude ?? DEFAULT_MAP_COORDINATES[0];
    mainFeature.properties._latitude =
      mainFeature.properties._latitude ?? DEFAULT_MAP_COORDINATES[1];
    mainFeature.properties._zoom =
      mainFeature.properties._zoom ?? DEFAULT_MAP_ZOOM;
    mainFeature.properties._backgroundColor =
      mainFeature.properties._backgroundColor ?? DEFAULT_BACKGROUND_COLOR;
    mainFeature.properties._minZoom =
      mainFeature.properties._minZoom ?? DEFAULT_MIN_ZOOM;
    mainFeature.properties._maxZoom =
      mainFeature.properties._maxZoom ?? DEFAULT_MAX_ZOOM;
    mainFeature.properties._bearing =
      mainFeature.properties._bearing ?? DEFAULT_BEARING;
    mainFeature.properties._pitch =
      mainFeature.properties._pitch ?? DEFAULT_PITCH;

    this.mainFeature = mainFeature;

    this.mainLayout = new MainLayout({
      parentFeature: this.mainFeature,
    });

    this.timeline = new Timeline();

    // this.interactionManager = new InteractionManager({ viewport: this });

    this.onViewStateChange = this.onViewStateChange.bind(this);
    this.layerFilter = this.layerFilter.bind(this);
    this.onLoad = this.onLoad.bind(this);

    this.update();
  }

  dispose() {
    this.deck?.finalize();
    this.deck = null;
  }

  onLoad() {
    console.log('onLoad');
    // @ts-ignore
    // const { gl } = this.deck.deckRenderer;
    // this.deck._addResources({
    //   iconAtlas: getIconAtlas(gl),
    // });

    this.update();
    if (this.props.onLoad) {
      this.props.onLoad();
    }
  }

  updateCanvasSize(width: number, height: number) {
    if (this.props.canvas) {
      this.props.canvas.style.width = `${width}px`;
      this.props.canvas.style.height = `${height}px`;
      // just to update the props (however it is not used)
      this.props.width = width;
      this.props.height = height;
      // this is what is used
      this.mainFeature.properties._width = width;
      this.mainFeature.properties._height = height;
      this.update();
    }
  }

  getViews(): any {
    // add board layout view
    const views = [
      this.mainLayout.getView({
        // interactionMode: this.interactionMode,
        // disableController: this.interactionManager.disableController,
        // orthographic: this.props.orthographic === false ? false : true,
      }),
    ];

    return views;
  }

  getViewStates(): {
    [viewId: string]: any;
  } {
    const viewStates: any = {
      [this.mainLayout.getViewId()]: {
        ...this.mainLayout.getViewState(),
      },
    };
    return viewStates;
  }

  onViewStateChange({
    viewState,
    viewId,
    interactionState,
    oldViewState,
  }: ViewStateChangeParameters & { viewId: string }) {
    // if board layout - change the main camera
    if (viewId === this.mainLayout.getViewId()) {
      this.mainLayout.setCameraFrame({
        ...this.mainLayout.getCameraFrame(),
        ...viewState,
      });
      this.update();
    } else {
      const versionUri = viewId;
      const featureLayout = this.featureLayouts[versionUri];
      if (featureLayout) {
        featureLayout.setCameraFrame(viewState);
        this.update();
      }
    }
  }

  layerFilter({ layer, viewport }: FilterContext) {
    if (!layer || !viewport) {
      return false;
    }
    if (!layer.id.startsWith(viewport.id)) {
      return false;
    }
    return true;
  }

  getLayers() {
    const viewportLayers = this.mainLayout.getLayers() || [];
    const visibleNodes = this.mainLayout.getVisibleFeatures() || [];
    for (const child of visibleNodes) {
      const { versionUri } = child;
      let featureLayout = this.featureLayouts[versionUri];
      if (featureLayout) {
        const childLayers = featureLayout.getLayers();
        if (childLayers && childLayers.length > 0) {
          viewportLayers.push(...childLayers);
        }
      }
    }
    return viewportLayers;
  }

  getProps() {
    const backgroundColor =
      this.mainLayout.getBackgroundColor() || DEFAULT_BACKGROUND_COLOR;

    const props: DeckProps = {
      canvas: this.props.canvas,
      _animate: false,
      parameters: {
        depthMask: true,
        depthTest: true,
        blend: true,
        blendFunc: [
          GL.SRC_ALPHA,
          GL.ONE_MINUS_SRC_ALPHA,
          GL.ONE,
          GL.ONE_MINUS_SRC_ALPHA,
        ],
        polygonOffsetFill: true,
        depthFunc: GL.LEQUAL,
        blendEquation: GL.FUNC_ADD,
        clearColor: [
          backgroundColor[0] / 256,
          backgroundColor[1] / 256,
          backgroundColor[2] / 256,
          backgroundColor[3] / 256,
        ],
      },
      width: this.mainFeature.properties._width,
      height: this.mainFeature.properties._height,
      viewState: this.getViewStates(),
      views: this.getViews(),
      layerFilter: this.layerFilter,
      layers: this.getLayers(),
      effects: [],
      getTooltip: null,
      useDevicePixels: true,
      onViewStateChange: this.onViewStateChange,
      onLoad: this.onLoad,
      onError: (error: Error) => {
        console.log('error', error);
        if (this.props.onContextLost) {
          this.props.onContextLost(error);
        }
      },
    };
    return props;
  }

  update(updateTriggers?: UpdateTriggers) {
    if (!this.deck) {
      this.deck = new Deck(this.getProps());
      return;
    }
    if (updateTriggers) {
      this.mainLayout.applyUpdateTriggers(updateTriggers);
    }
    try {
      this.deck.setProps(this.getProps());
    } catch (e) {
      console.log('error updating viewport', e);
    }
  }
}
