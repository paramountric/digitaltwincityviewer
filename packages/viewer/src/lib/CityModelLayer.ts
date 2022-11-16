import { CompositeLayer, COORDINATE_SYSTEM } from '@deck.gl/core';
import type { CompositeLayerProps } from '@deck.gl/core/typed';
import { SolidPolygonLayer } from '@deck.gl/layers';
import { mat4 } from 'gl-matrix';

export type CityModelProps<DataT = any> = _CityModelProps &
  CompositeLayerProps<DataT>;
type _CityModelProps<DataT = any> = {};

const defaultProps = {};

const HIGHLIGHT_COLOR = [100, 150, 250, 255];

export default class CityModelLayer<
  DataT = any,
  ExtraProps = {}
> extends CompositeLayer<Required<_CityModelProps<DataT>> & ExtraProps> {
  static defaultProps = defaultProps;
  static layerName = 'CityModelLayer';

  props: any;

  updateState({ changeFlags, props }) {
    if (changeFlags.dataChanged) {
      console.log('data changed triggered');
    }
  }
  renderLayers() {
    const {
      id,
      data,
      modelMatrix = mat4.create(),
      coordinateOrigin,
      pickable = false,
    } = this.props;
    return [
      new SolidPolygonLayer({
        id: `${id}-solid-polygon`,
        data,
        modelMatrix,
        pickable,
        opacity: 1,
        autoHighlight: true,
        highlightColor: HIGHLIGHT_COLOR,
        extruded: true,
        wireframe: true,
        // coordinateSystem: COORDINATE_SYSTEM.METER_OFFSETS,
        // coordinateOrigin,
        getPolygon: d => d.geometry.coordinates,
        getFillColor: d => d.properties.color || [255, 255, 255, 255],
        getLineColor: [100, 100, 100],
        getElevation: d => {
          return d.properties.height;
        },
        useDevicePixels: true,
      }),
    ];
  }
}
