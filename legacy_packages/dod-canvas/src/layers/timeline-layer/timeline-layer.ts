import { COORDINATE_SYSTEM, CompositeLayer } from '@deck.gl/core';

import Stylesheet from '../graphgl-layers/style/style-sheet.js';
import { NODE_TYPE, EDGE_DECORATOR_TYPE } from '../graphgl-layers/constants.js';
import { mixedGetPosition } from '../graphgl-layers/utils/layer-utils.js';
import InteractionManager from '../graphgl-layers/interaction-manager.js';

import { log } from '../graphgl-layers/utils/log.js';

type TimelineLayerProps = {
  nodeStyle?: any;
  nodeEvents?: any;
  edgeStyle?: any;
  edgeEvents?: any;
  pickable?: boolean;
  engine?: any;
  state?: any;
};

const defaultProps = {
  // an array of styles for layers
  nodeStyle: [],
  nodeEvents: {
    onMouseLeave: () => {
      //
    },
    onHover: () => {
      //
    },
    onMouseEnter: () => {
      //
    },
    onClick: () => {
      //
    },
    onDrag: () => {
      //
    },
  },
  edgeStyle: {
    color: 'black',
    strokeWidth: 1,
    // an array of styles for layers
    decorators: [],
  },
  edgeEvents: {
    onClick: () => {
      //
    },
    onHover: () => {
      //
    },
  },
  enableDragging: false,
  pickable: false,
};

// node layers
import CircleLayer from '../graphgl-layers/node-layers/circle-layer.js';
import ImageLayer from '../graphgl-layers/node-layers/image-layer.js';
import NodeLabelLayer from '../graphgl-layers/node-layers/label-layer.js';
import RectangleLayer from '../graphgl-layers/node-layers/rectangle-layer.js';
import ZoomableMarkerLayer from '../graphgl-layers/node-layers/zoomable-marker-layer.js';
import TimelineTextLayer from './timeline-text-layer.js';

const NODE_LAYER_MAP = {
  [NODE_TYPE.RECTANGLE]: RectangleLayer,
  [NODE_TYPE.ICON]: ImageLayer,
  [NODE_TYPE.CIRCLE]: CircleLayer,
  [NODE_TYPE.LABEL]: NodeLabelLayer,
  [NODE_TYPE.MARKER]: ZoomableMarkerLayer,
  TEXT: TimelineTextLayer,
};

// edge layers
import CompositeEdgeLayer from '../graphgl-layers/composite-edge-layer.js';
import EdgeLabelLayer from '../graphgl-layers/edge-layers/edge-label-layer.js';
import FlowLayer from '../graphgl-layers/edge-layers/flow-layer.js';

const EDGE_DECORATOR_LAYER_MAP = {
  [EDGE_DECORATOR_TYPE.LABEL]: EdgeLabelLayer,
  [EDGE_DECORATOR_TYPE.FLOW]: FlowLayer,
};

const SHARED_LAYER_PROPS = {
  coordinateSystem: COORDINATE_SYSTEM.IDENTITY,
  parameters: {
    depthTest: false,
  },
};

export default class TimelineLayer extends CompositeLayer {
  static layerName: string;
  static defaultProps: TimelineLayerProps = {
    pickable: true,
  };
  props: TimelineLayerProps;
  state: any;
  context: any;

  constructor(props) {
    super(props);
    props.engine.registerCallbacks({
      onLayoutChange: () => this.forceUpdate(),
    });
  }

  initializeState() {
    const interactionManager = new InteractionManager(this.props, () =>
      this.forceUpdate()
    );
    this.state = { interactionManager };
  }

  shouldUpdateState({ changeFlags }) {
    return changeFlags.dataChanged || changeFlags.propsChanged;
  }

  updateState({ props }) {
    this.state.interactionManager.updateProps(props);
  }

  finalize() {
    this.props.engine.unregisterCallbacks();
  }

  forceUpdate() {
    if (this.context && this.context.layerManager) {
      // @ts-ignore somehow the parent methods are not visible to TS
      this.setNeedsUpdate();
      // @ts-ignore somehow the parent methods are not visible to TS
      this.setChangeFlags({ dataChanged: true });
    }
  }

  createNodeLayers() {
    const { engine, nodeStyle } = this.props;
    if (!nodeStyle || !Array.isArray(nodeStyle) || nodeStyle.length === 0) {
      return [];
    }
    return nodeStyle.filter(Boolean).map((style, idx) => {
      const { pickable = true, ...restStyle } = style;
      const LayerType = NODE_LAYER_MAP[style.type] as CompositeLayer;
      if (!LayerType) {
        log.error(`Invalid node type: ${style.type}`)();
        throw new Error(`Invalid node type: ${style.type}`);
      }
      const stylesheet = new Stylesheet(restStyle, {
        stateUpdateTrigger: this.state.interactionManager.getLastInteraction(),
      });
      const getOffset = stylesheet.getDeckGLAccessor('getOffset');
      const nodes = engine.getNodes();
      return new LayerType({
        ...SHARED_LAYER_PROPS,
        id: `timeline-node-rule-${idx}`,
        data: nodes,
        scaleWithZoom: style.scaleWithZoom,
        getPosition: mixedGetPosition(engine.getNodePosition, getOffset),
        pickable,
        positionUpdateTrigger: [
          engine.getLayoutLastUpdate(),
          engine.getLayoutState(),
          stylesheet.getDeckGLAccessorUpdateTrigger('getOffset'),
        ].join(),
        stylesheet,
      });
    });
  }

  createEdgeLayers() {
    const { edgeStyle, engine } = this.props;
    const { decorators, ...restEdgeStyle } = edgeStyle;
    const stylesheet = new Stylesheet(
      {
        type: 'Edge',
        ...restEdgeStyle,
      },
      {
        stateUpdateTrigger: this.state.interactionManager.getLastInteraction(),
      }
    );
    const edgeLayer = new CompositeEdgeLayer({
      ...SHARED_LAYER_PROPS,
      id: 'timeline-edge-layer',
      data: engine.getEdges(),
      getLayoutInfo: engine.getEdgePosition,
      pickable: true,
      positionUpdateTrigger: [
        engine.getLayoutLastUpdate(),
        engine.getLayoutState(),
      ].join(),
      stylesheet,
    });

    if (!decorators || !Array.isArray(decorators) || decorators.length === 0) {
      return edgeLayer;
    }

    const decoratorLayers = decorators.filter(Boolean).map((style, idx) => {
      const DecoratorLayer = EDGE_DECORATOR_LAYER_MAP[
        style.type
      ] as CompositeLayer;
      // invalid decorator layer type
      if (!DecoratorLayer) {
        log.error(`Invalid edge decorator type: ${style.type}`)();
        throw new Error(`Invalid edge decorator type: ${style.type}`);
      }
      const decoratorStylesheet = new Stylesheet(style, {
        stateUpdateTrigger: this.state.interactionManager.getLastInteraction(),
      });
      return new DecoratorLayer({
        ...SHARED_LAYER_PROPS,
        id: `timeline-edge-decorator-${idx}`,
        data: engine.getGraph().getEdges(),
        getLayoutInfo: engine.getEdgePosition,
        pickable: true,
        positionUpdateTrigger: [
          engine.getLayoutLastUpdate(),
          engine.getLayoutState(),
        ].join(),
        stylesheet: decoratorStylesheet,
      });
    });
    return [edgeLayer, decoratorLayers];
  }

  onClick(info) {
    this.state.interactionManager.onClick(info);
  }

  onHover(info) {
    this.state.interactionManager.onHover(info);
  }

  onDragStart(info, event) {
    this.state.interactionManager.onDragStart(info, event);
  }

  onDrag(info, event) {
    this.state.interactionManager.onDrag(info, event);
  }

  onDragEnd(info, event) {
    this.state.interactionManager.onDragEnd(info, event);
  }

  renderLayers() {
    if (!this.props.engine.getGraph()) {
      return [];
    }
    return [/*this.createEdgeLayers(),*/ this.createNodeLayers()];
  }
}

TimelineLayer.layerName = 'TimelineLayer';
TimelineLayer.defaultProps = defaultProps;
