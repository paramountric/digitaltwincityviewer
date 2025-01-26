import { COORDINATE_SYSTEM, CompositeLayer } from '@deck.gl/core';

import { EDGE_TYPE } from './constants.js';
import StraightLineEdge from './edge-layers/straight-line-edge.js';
import PathEdge from './edge-layers/path-edge.js';
import CurvedEdge from './edge-layers/curved-edge.js';
import CurveEdge from './edge-layers/curve-edge.js';

const EDGE_LAYER_MAP = {
  [EDGE_TYPE.LINE]: StraightLineEdge,
  [EDGE_TYPE.PATH]: PathEdge,
  [EDGE_TYPE.SPLINE_CURVE]: CurvedEdge,
  [EDGE_TYPE.CURVE]: CurveEdge,
};

export default class EdgeLayer extends CompositeLayer {
  static layerName = 'EdgeLayer';

  static defaultProps = {
    data: [],
    pickable: true,
    getLayoutInfo: d => ({
      type: d.type || EDGE_TYPE.LINE,
      sourcePosition: d.sourcePosition,
      targetPosition: d.targetPosition,
      sourceDirection: d.sourceDirection,
      targetDirection: d.targetDirection,
      controlPoints: [],
    }),
    positionUpdateTrigger: 0,
  };

  constructor(props) {
    super(props);
  }

  updateState({ props, oldProps, changeFlags }) {
    super.updateState({ props, oldProps, changeFlags });
    if (changeFlags.dataChanged) {
      this.updateStateData(props);
    }
  }

  // this is used to combine edge types (for example some needs to be lines, curves, dashed)
  updateStateData() {
    const { data, getLayoutInfo } = this.props;
    // group edges by types
    const typedEdgeData = data.reduce(
      (res, edge) => {
        const { type } = getLayoutInfo(edge);
        console.log(type);
        res[type] = res[type].concat(edge);
        return res;
      },
      {
        [EDGE_TYPE.LINE]: [],
        [EDGE_TYPE.PATH]: [],
        [EDGE_TYPE.SPLINE_CURVE]: [],
        [EDGE_TYPE.CURVE]: [],
      }
    );
    this.setState({ typedEdgeData });
  }

  renderLayers() {
    const {
      getLayoutInfo,
      pickable,
      positionUpdateTrigger,
      stylesheet,
      widthScale = 1,
      widthMinPixels = 1,
      widthMaxPixels = 2,
    } = this.props;

    const { typedEdgeData } = this.state;

    // console.log('look into this; where are curves');
    // console.log(typedEdgeData);

    // render lines by types (straight line, path, curves)
    return Object.entries(typedEdgeData).map(e => {
      const [type, edgeData] = e;
      const Layer = EDGE_LAYER_MAP[type];
      // invalid edge layer type
      if (!Layer) {
        return null;
      }
      return new Layer({
        data: edgeData,
        getLayoutInfo,
        getColor: stylesheet.getDeckGLAccessor('getColor'),
        getWidth: stylesheet.getDeckGLAccessor('getWidth'),
        colorUpdateTrigger:
          stylesheet.getDeckGLAccessorUpdateTrigger('getColor'),
        widthUpdateTrigger:
          stylesheet.getDeckGLAccessorUpdateTrigger('getWidth'),
        positionUpdateTrigger,
        pickable,
        coordinateSystem: COORDINATE_SYSTEM.IDENTITY,
        parameters: {
          depthTest: false,
        },
        widthUnits: 'pixels',
        widthScale,
        widthMinPixels,
        widthMaxPixels,
      });
    });
  }
}
