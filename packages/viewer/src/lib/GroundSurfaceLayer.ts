import { CompositeLayer, COORDINATE_SYSTEM } from '@deck.gl/core';
import type { CompositeLayerProps } from '@deck.gl/core/typed';
import { SimpleMeshLayer } from '@deck.gl/mesh-layers';
import { Geometry } from '@luma.gl/engine';

const defaultProps = {};

const HIGHLIGHT_COLOR = [100, 150, 250, 255];

export default class GroundSurfaceLayer extends CompositeLayer {
  static defaultProps = defaultProps;
  static layerName = 'GroundSurfaceLayer';

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
      modelMatrix,
      coordinateOrigin = [0, 0],
      coordinateSystem = 1,
    } = this.props;

    const mesh = new Geometry({
      attributes: {
        positions: new Float32Array(data.vertices),
        COLOR_0: { size: 4, value: new Float32Array(data.colors) },
      },
      indices: { size: 1, value: new Uint32Array(data.indices) },
    });
    return [
      new SimpleMeshLayer({
        id: `${id}-mesh`,
        data: [1],
        mesh,
        modelMatrix,
        _instanced: false,
        _useMeshColors: true,
        wireframe: false,
        coordinateSystem,
        coordinateOrigin,
        getPosition: d => [0, 0, 0],
        parameters: {
          depthTest: true,
        },
        getColor: d => [255, 255, 255],
      }),
    ];
  }
}
