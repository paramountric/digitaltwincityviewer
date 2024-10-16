import { Deck, Layer, DeckProps, FilterContext } from '@deck.gl/core/typed';
import { ViewStateChangeParameters } from '@deck.gl/core/typed/controllers/controller';
import GL from '@luma.gl/constants';
import { ViewportProps } from './types';
import { Timeline } from './lib/timeline';
const DEFAULT_BACKGROUND_COLOR = [2, 6, 23, 255] as [
  number,
  number,
  number,
  number
];

type Layout = any;
type UpdateTriggers = any;

const defaultViewportProps: ViewportProps = {
  zoom: 10,
  backgroundColor: DEFAULT_BACKGROUND_COLOR,
};

export class Viewport {
  props: ViewportProps;
  deck: Deck | null;
  canvas: HTMLCanvasElement;
  mainLayout: Layout;
  featureLayouts: Map<string, Layout> = new Map();
  timeline: Timeline;
  constructor(viewportProps: ViewportProps) {
    const resolvedProps = Object.assign(
      defaultViewportProps,
      viewportProps,
      // will overwrite default and sent in
      {
        onLoad: this.onLoad.bind(this),
        onError: (error: Error) => {
          if (viewportProps.onContextLost) {
            viewportProps.onContextLost(error);
          }
        },
        getTooltip: null,
      }
    ) as DeckProps;
    this.props = resolvedProps as ViewportProps;

    this.timeline = new Timeline();

    // const position = (
    //   boardNode.appearance?.position
    //     ? [...boardNode.appearance.position]
    //     : [TILE_SIZE / 2, TILE_SIZE / 2, 0]
    // ) as [number, number, number];

    // const initialCameraFrame: Appearance = {
    //   position,
    //   target: boardNode.appearance?.target || position,
    //   zoom: boardNode.appearance?.zoom || DEFAULT_START_ZOOM,
    //   rotationOrbit: boardNode.appearance?.rotationOrbit || 0,
    //   rotationX: boardNode.appearance?.rotationX || 90,
    //   minZoom: boardNode.appearance?.minZoom || DEFAULT_MIN_ZOOM,
    //   maxZoom: boardNode.appearance?.maxZoom || DEFAULT_MAX_ZOOM,
    //   backgroundColor:
    //     boardNode.appearance?.backgroundColor ||
    //     (DEFAULT_BACKGROUND_COLOR as [number, number, number]),
    //   viewX: boardNode.appearance?.viewX || 0,
    //   viewY: boardNode.appearance?.viewY || 0,
    //   paddingLeft: boardNode.appearance?.paddingLeft || 0,
    //   width: this.props.width,
    //   height: this.props.height,
    // };

    // console.log('initialCameraFrame', initialCameraFrame);

    // this.boardNode = {
    //   id: boardNode.id || defaultProjectNode.id,
    //   key: boardNode.key || defaultProjectNode.key,
    //   type: boardNode.type || NODE_TYPE_BOARD,
    //   name: boardNode.name || defaultProjectNode.name,
    //   // the boardNode is the board and the id === boardId
    //   boardId: boardNode.id || defaultProjectNode.id,
    //   namespace: boardNode.namespace || defaultProjectNode.namespace,
    //   appearance: {
    //     // add settings from DB for the board / node here
    //     ...initialCameraFrame,
    //     // cannot override the size of the board
    //     size: [DEFAULT_VIEW_AREA_SIZE, DEFAULT_VIEW_AREA_SIZE],
    //   },
    // };
    // this.boardLayout = new BoardLayout({
    //   parentNodeProps: this.boardNode,
    //   timeline: this.timeline,
    //   cameraFrame: {
    //     ...initialCameraFrame,
    //   },
    // });

    // this.interactionManager = new InteractionManager({ viewport: this });

    this.onViewStateChange = this.onViewStateChange.bind(this);
    this.layerFilter = this.layerFilter.bind(this);

    this.deck = new Deck(resolvedProps);
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

    // @ts-ignore
    this.canvas = this.deck.canvas;

    this.update();
    if (this.props.onLoad) {
      this.props.onLoad();
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
    const visibleNodes = this.mainLayout.getVisibleNodes() || [];
    for (const child of visibleNodes) {
      const { versionUri } = child;
      let featureLayout = this.featureLayouts[versionUri];
      if (featureLayout) {
        const childLayers = featureLayout.getLayers();
        // console.log('childlayers', childLayers);
        if (childLayers && childLayers.length > 0) {
          viewportLayers.push(...childLayers);
        }
      }
    }
    return viewportLayers;
  }

  getProps({ extraProps = undefined } = {}) {
    const backgroundColor =
      this.mainLayout.getBackgroundColor() ||
      this.props.backgroundColor ||
      DEFAULT_BACKGROUND_COLOR;

    const props: DeckProps = {
      ...this.props,
      ...extraProps,
      _animate: true,
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
      width: this.props.width,
      height: this.props.height,
      viewState: this.getViewStates(),
      views: this.getViews(),
      onViewStateChange: this.onViewStateChange,
      layerFilter: this.layerFilter,
      //   layers: this.getLayers(),
      effects: [],
      getTooltip: null,
      useDevicePixels: true,
    };
    return props;
  }

  update(updateTriggers?: UpdateTriggers) {
    if (!this.deck) {
      console.log('no deck');
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
