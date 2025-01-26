import { COORDINATE_SYSTEM, CompositeLayer } from '@deck.gl/core';

import Stylesheet from './style/style-sheet.js';
import { NODE_TYPE, EDGE_DECORATOR_TYPE } from './constants.js';
import { mixedGetPosition } from './utils/layer-utils.js';
import InteractionManager from './interaction-manager.js';

import { log } from './utils/log.js';

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
};

// node layers
import CircleLayer from './node-layers/circle-layer.js';
import ImageLayer from './node-layers/image-layer.js';
import NodeLabelLayer from './node-layers/label-layer.js';
import RectangleLayer from './node-layers/rectangle-layer.js';
import ZoomableMarkerLayer from './node-layers/zoomable-marker-layer.js';

const NODE_LAYER_MAP = {
  [NODE_TYPE.RECTANGLE]: RectangleLayer,
  [NODE_TYPE.ICON]: ImageLayer,
  [NODE_TYPE.CIRCLE]: CircleLayer,
  [NODE_TYPE.LABEL]: NodeLabelLayer,
  [NODE_TYPE.MARKER]: ZoomableMarkerLayer,
};

// edge layers
import CompositeEdgeLayer from './composite-edge-layer.js';
import EdgeLabelLayer from './edge-layers/edge-label-layer.js';
import FlowLayer from './edge-layers/flow-layer.js';

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

export default class GraphLayer extends CompositeLayer {
  static defaultProps = {
    pickable: true,
  };

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
      this.setNeedsUpdate();
      this.setChangeFlags({ dataChanged: true });
    }
  }

  createNodeLayers() {
    const { engine, nodeStyle } = this.props;
    if (!nodeStyle || !Array.isArray(nodeStyle) || nodeStyle.length === 0) {
      return [];
    }
    const layers = [];
    let idx = 0;
    for (const style of nodeStyle) {
      idx++;
      if (
        !style ||
        this.context.viewport.zoom < (style.minZoom || 0) ||
        this.context.viewport.zoom > (style.maxZoom || Infinity)
      ) {
        continue;
      }
      const {
        pickable = true,
        radiusMinPixels,
        radiusMaxPixels,
        sizeMinPixels,
        sizeMaxPixels,
        pixelOffset,
        filterKeys,
        ...restStyle
      } = style;
      const LayerType = NODE_LAYER_MAP[style.type];
      if (!LayerType) {
        log.error(`Invalid node type: ${style.type}`)();
        throw new Error(`Invalid node type: ${style.type}`);
      }
      const stylesheet = new Stylesheet(restStyle, {
        stateUpdateTrigger: this.state.interactionManager.getLastInteraction(),
      });
      const getOffset = stylesheet.getDeckGLAccessor('getOffset');
      layers.push(
        new LayerType({
          ...SHARED_LAYER_PROPS,
          id: `node-rule-${idx}`,
          data: engine.getNodes(filterKeys), // clustered or from original graph
          getPosition: mixedGetPosition(engine.getNodePosition, getOffset),
          pickable,
          positionUpdateTrigger: [
            engine.getLayoutLastUpdate(),
            engine.getLayoutState(),
            stylesheet.getDeckGLAccessorUpdateTrigger('getOffset'),
          ].join(),
          stylesheet,
          radiusMaxPixels,
          radiusMinPixels,
          sizeMinPixels,
          sizeMaxPixels,
          getPixelOffset: d => {
            if (d.xPixelOffset || d.yPixelOffset) {
              return [d.xPixelOffset || 0, d.yPixelOffset || 0];
            }
            return pixelOffset || [0, 0];
          },
        })
      );
    }
    return layers;
  }

  createEdgeLayers() {
    const { edgeStyle, engine } = this.props;
    const {
      decorators,
      widthScale,
      widthMinPixels,
      widthMaxPixels,
      ...restEdgeStyle
    } = edgeStyle;
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
      id: 'edge-layer',
      data: engine.getEdges(),
      getLayoutInfo: engine.getEdgePosition,
      pickable: false,
      positionUpdateTrigger: [
        engine.getLayoutLastUpdate(),
        engine.getLayoutState(),
      ].join(),
      stylesheet,
      widthScale,
      widthMinPixels,
      widthMaxPixels,
    });

    if (!decorators || !Array.isArray(decorators) || decorators.length === 0) {
      return edgeLayer;
    }

    const decoratorLayers = decorators.filter(Boolean).map((style, idx) => {
      const DecoratorLayer = EDGE_DECORATOR_LAYER_MAP[style.type];
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
        id: `edge-decorator-${idx}`,
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
    return [this.createEdgeLayers(), this.createNodeLayers()];
  }
}

GraphLayer.layerName = 'GraphLayer';
GraphLayer.defaultProps = defaultProps;
