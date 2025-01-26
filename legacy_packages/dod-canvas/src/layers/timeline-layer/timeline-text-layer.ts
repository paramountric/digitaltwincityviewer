import { CompositeLayer } from '@deck.gl/core';
import ZoomableTextLayer from '../deckgl-layers/zoomable-text-layer.js';

export default class TimelineTextLayer extends CompositeLayer {
  props: any;
  static layerName = 'TimelineTextLayer';

  renderLayers() {
    const {
      data,
      getPosition,
      stylesheet,
      scaleWithZoom,
      positionUpdateTrigger = 0,
    } = this.props;

    return [
      new ZoomableTextLayer(
        // @ts-ignore somehow the parent methods are not visible to TS
        this.getSubLayerProps({
          id: '__timeline-text-layer',
          data,
          getPosition,
          scaleWithZoom,
          ...stylesheet.getDeckGLAccessors(),
          updateTriggers: {
            ...stylesheet.getDeckGLUpdateTriggers(),
            getPosition: positionUpdateTrigger,
          },
        })
      ),
    ];
  }
}
