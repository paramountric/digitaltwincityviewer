import { CompositeLayer } from '@deck.gl/core';
import { IconLayer } from '@deck.gl/layers';

import MarkerMapping from './marker-mapping.js';
import AtlasDataURL from './atlas-data-url.js';

export default class MarkerLayer extends CompositeLayer {
  static layerName = 'MarkerLayer';

  static defaultProps = {
    id: 'MarkerLayer',
    data: [],
    getMarker: d => d.marker,
    getColor: d => [0, 0, 0],
    getSize: d => 10,
  };

  renderLayers() {
    const { getMarker, ...otherProps } = this.props;
    return [
      new IconLayer(
        this.getSubLayerProps({
          id: 'marker-layer',
          iconAtlas: AtlasDataURL.dataURL,
          iconMapping: MarkerMapping,
          getIcon: getMarker,
          ...otherProps,
        })
      ),
    ];
  }
}
