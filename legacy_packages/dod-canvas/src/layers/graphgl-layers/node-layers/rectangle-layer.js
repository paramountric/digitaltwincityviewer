import { CompositeLayer } from '@deck.gl/core';
import { SolidPolygonLayer } from '@deck.gl/layers';

const generateRectangle = (node, { getWidth, getHeight, getPosition }) => {
  const pos = getPosition(node);
  // somewhere earlier a zero value is set to undefined
  if (!pos[0]) {
    pos[0] = 0;
  }
  if (!pos[1]) {
    pos[1] = 0;
  }
  const width = typeof getWidth === 'function' ? getWidth(node) : getWidth;
  const height = typeof getWidth === 'function' ? getHeight(node) : getHeight;
  const halfWidth = width / 2;
  const halfHeight = height / 2;
  return [
    [pos[0] - halfWidth, pos[1] - halfHeight],
    [pos[0] - halfWidth, pos[1] + halfHeight],
    [pos[0] + halfWidth, pos[1] + halfHeight],
    [pos[0] + halfWidth, pos[1] - halfHeight],
  ];
};

export default class RectangleLayer extends CompositeLayer {
  static layerName = 'RectangleLayer';

  renderLayers() {
    const {
      data,
      getPosition,
      stylesheet,
      positionUpdateTrigger = 0,
    } = this.props;

    const getFillColor = stylesheet.getDeckGLAccessor('getFillColor');
    const getLineWidth = stylesheet.getDeckGLAccessor('getLineWidth');

    return [
      new SolidPolygonLayer(
        this.getSubLayerProps({
          id: '__polygon-layer',
          data,
          getPolygon: node =>
            generateRectangle(node, {
              getPosition,
              getWidth: stylesheet.getDeckGLAccessor('getWidth'),
              getHeight: stylesheet.getDeckGLAccessor('getHeight'),
            }),
          filled: Boolean(getFillColor),
          stroked: Boolean(getLineWidth),
          ...stylesheet.getDeckGLAccessors(),
          updateTriggers: {
            getPolygon: [
              positionUpdateTrigger,
              stylesheet.getDeckGLAccessorUpdateTrigger('getWidth'),
              stylesheet.getDeckGLAccessorUpdateTrigger('getHeight'),
            ],
            ...stylesheet.getDeckGLUpdateTriggers(),
          },
        })
      ),
    ];
  }
}
