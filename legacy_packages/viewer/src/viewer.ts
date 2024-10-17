import {
  Deck,
  DeckProps,
  MapView,
  MapViewState,
  FilterContext,
  LinearInterpolator,
} from '@deck.gl/core/typed';
import GL from '@luma.gl/constants';
import EventSource from './event-source';
import { ViewerProps, defaultViewerProps } from './viewer-props';
import { FeatureManager } from './feature-manager';
import { InteractionManager } from './interaction-manager';
import { ViewManager } from './view-manager';
import { FileManager } from './file-manager';

export class Viewer extends EventSource {
  props: ViewerProps;
  deck: Deck;
  canvas?: HTMLCanvasElement;
  interactionManager: InteractionManager;
  viewManager: ViewManager;
  featureManager: FeatureManager;
  fileManager: FileManager;
  constructor(viewerProps: ViewerProps) {
    super();
    const resolvedProps = Object.assign(
      {
        width: window.innerWidth,
        height: window.innerHeight,
      },
      defaultViewerProps,
      viewerProps,
      {
        onLoad: this.onLoad.bind(this),
        // onResize: this.onResize.bind(this),
        getCursor: this.getCursor.bind(this),
        getTooltip: () => null,
      }
    ) as DeckProps;
    this.props = resolvedProps as ViewerProps;
    this.deck = new Deck(resolvedProps);

    this.interactionManager = new InteractionManager({ viewer: this });
    this.viewManager = new ViewManager({ viewer: this });
    this.featureManager = new FeatureManager({ viewer: this });
    this.fileManager = new FileManager({ viewer: this });
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

    this.canvas.addEventListener('dragover', (e: any) => {
      e.preventDefault();
    });
    this.canvas.addEventListener('drop', (e: any) => {
      e.preventDefault();
      if (e.dataTransfer?.files?.length > 0) {
        this.fileManager.importFile(e.dataTransfer.files[0]);
      }
    });
    this.update();
  }

  getCursor(info: any) {
    return this.interactionManager.getCursor(info);
  }

  getProps(): ViewerProps & DeckProps {
    const backgroundColor = this.viewManager.getBackgroundColor();
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
        clearColor: [
          backgroundColor[0] / 256,
          backgroundColor[1] / 256,
          backgroundColor[2] / 256,
          1,
        ],
      },
      width: this.props.width,
      height: this.props.height,
      viewState: this.viewManager.getViewStates(),
      views: this.viewManager.getViews(),
      onViewStateChange: this.viewManager.onViewStateChange,
      onInteractionStateChange: this.onInteractionStateChange,
      layerFilter: this.layerFilter,
      layers: this.getLayers(),
      effects: [],
    };
  }

  onInteractionStateChange(interactionState: any) {
    this.interactionManager.onInteractionStateChange(interactionState);
  }

  layerFilter({ layer, viewport }: FilterContext) {
    return true;
  }

  getLayers() {
    const viewLayers = this.viewManager.getLayers();
    const featureLayers = this.featureManager.getLayers();
    return [...viewLayers, ...featureLayers];
  }

  update() {
    this.deck.setProps(this.getProps());
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
}
