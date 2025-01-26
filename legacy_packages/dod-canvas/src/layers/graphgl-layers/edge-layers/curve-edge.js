import { CompositeLayer } from '@deck.gl/core';
import { CurveLayer } from '../../curve-layer/curve-layer.js';

export default class CurveEdge extends CompositeLayer {
  static layerName = 'CurveEdge';

  renderLayers() {
    const {
      data,
      getLayoutInfo,
      positionUpdateTrigger = 0,
      colorUpdateTrigger = 0,
      widthUpdateTrigger = 0,
      ...otherProps
    } = this.props;
    return [
      new CurveLayer(
        this.getSubLayerProps({
          id: '__curve-layer',
          data,
          getSourcePosition: e => getLayoutInfo(e).sourcePosition,
          getTargetPosition: e => getLayoutInfo(e).targetPosition,
          getSourceDirection: e => getLayoutInfo(e).sourceDirection,
          getTargetDirection: e => getLayoutInfo(e).targetDirection,
          getLinkIsPlaceholder: e => 0,
          updateTriggers: {
            getColor: colorUpdateTrigger,
            getSourcePosition: positionUpdateTrigger,
            getTargetPosition: positionUpdateTrigger,
            getWidth: widthUpdateTrigger,
          },
          ...otherProps,
        })
      ),
    ];
  }
}
