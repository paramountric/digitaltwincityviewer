import { CompositeLayer, COORDINATE_SYSTEM } from '@deck.gl/core';
import type { CompositeLayerProps } from '@deck.gl/core/typed';
import { ScatterplotLayer } from '@deck.gl/layers';

export type PoiProps<DataT = any> = _PoiProps & CompositeLayerProps<DataT>;
type _PoiProps<DataT = any> = {};

const defaultProps = {
  pickable: true,
  opacity: 0.8,
  stroked: true,
  filled: true,
  radiusScale: 6,
  radiusMinPixels: 1,
  radiusMaxPixels: 100,
  lineWidthMinPixels: 1,
  getPosition: d => d.coordinates,
  getRadius: d => d.radius || 10,
  getFillColor: d => [255, 140, 0],
  getLineColor: d => [0, 0, 0],
};

const HIGHLIGHT_COLOR = [100, 150, 250, 255];

export default class PoiLayer<
  DataT = any,
  ExtraProps = {}
> extends CompositeLayer<Required<_PoiProps<DataT>> & ExtraProps> {
  static defaultProps = defaultProps;
  static layerName = 'PoiLayer';

  props: any;

  updateState({ changeFlags, props }) {
    if (changeFlags.dataChanged) {
      console.log('data changed triggered');
    }
  }
  renderLayers() {
    const { id, data, modelMatrix, coordinateOrigin = [0, 0] } = this.props;
    console.log('render poi', id, data);
    return [
      new ScatterplotLayer({
        id: `${id}-scatterplot`,
        data,
        //modelMatrix,
        //coordinateSystem: COORDINATE_SYSTEM.METER_OFFSETS,
        //coordinateOrigin,
        highlightColor: HIGHLIGHT_COLOR,
        pickable: true,
        opacity: 0.8,
        stroked: true,
        filled: true,
        radiusScale: 6,
        radiusMinPixels: 1,
        radiusMaxPixels: 100,
        lineWidthMinPixels: 1,
        getPosition: d => d.coordinates,
        getRadius: 10,
        getFillColor: d => [255, 140, 0],
        getLineColor: d => [0, 0, 0],
      }),
    ];
  }
}
