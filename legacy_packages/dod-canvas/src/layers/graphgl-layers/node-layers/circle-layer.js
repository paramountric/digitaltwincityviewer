import { CompositeLayer } from '@deck.gl/core';
import { ScatterplotLayer } from '@deck.gl/layers';

export default class CircleLayer extends CompositeLayer {
  static layerName = 'CircleLayer';

  renderLayers() {
    const {
      data,
      getPosition,
      stylesheet,
      positionUpdateTrigger = 0,
      radiusMinPixels,
      radiusMaxPixels,
    } = this.props;

    const getFillColor = stylesheet.getDeckGLAccessor('getFillColor');
    const getLineWidth = stylesheet.getDeckGLAccessor('getLineWidth');

    return [
      new ScatterplotLayer(
        this.getSubLayerProps({
          id: '__scatterplot-layer',
          data,
          getPosition,
          stroked: Boolean(getLineWidth),
          filled: Boolean(getFillColor),
          ...stylesheet.getDeckGLAccessors(),
          updateTriggers: {
            getPosition: positionUpdateTrigger,
            ...stylesheet.getDeckGLUpdateTriggers(),
          },
          radiusMaxPixels,
          radiusMinPixels,
          lineWidthMinPixels: 1,
          lineWidthMaxPixels: 1,
          // override stroke/line width so that circle can scale but line is same thickness
          getLineWidth: () => {
            return stylesheet.properties.strokeWidth._value;
          },
        })
      ),
    ];
  }
}
