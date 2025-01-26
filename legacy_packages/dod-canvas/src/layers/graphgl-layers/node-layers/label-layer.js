import { CompositeLayer } from '@deck.gl/core';
import ZoomableTextLayer from '../../deckgl-layers/zoomable-text-layer.js';

export default class LabelLayer extends CompositeLayer {
  static layerName = 'LabelLayer';

  renderLayers() {
    const {
      data,
      getPosition,
      stylesheet,
      scaleWithZoom,
      positionUpdateTrigger = 0,
      getPixelOffset,
      sizeMaxPixels,
    } = this.props;

    return [
      new ZoomableTextLayer(
        this.getSubLayerProps({
          id: '__text-layer',
          data,
          getPosition,
          scaleWithZoom,
          ...stylesheet.getDeckGLAccessors(),
          updateTriggers: {
            ...stylesheet.getDeckGLUpdateTriggers(),
            getPosition: positionUpdateTrigger,
          },
          getPixelOffset,
          sizeMaxPixels,
        })
      ),
    ];
  }
}
