import { Model, Geometry } from '@luma.gl/engine';
import { project, picking, Layer, UNIT } from '@deck.gl/core';
import GL from '@luma.gl/constants';
import vs from './curve-layer-vertex.glsl.js';
import fs from './curve-layer-fragment.glsl.js';

const NUM_SEGMENTS = 50;
const defaultProps = {
  id: 'curve-layer',
  getSourcePosition: { type: 'accessor', value: x => x.sourcePosition },
  getTargetPosition: { type: 'accessor', value: x => x.targetPosition },
  getSourceDirection: { type: 'accessor', value: x => x.sourceDirection },
  getTargetDirection: { type: 'accessor', value: x => x.targetDirection },
  getColor: { type: 'accessor', value: x => [0, 0, 0] },
  getWidth: { type: 'accessor', value: x => x.width },
  getLinkIsPlaceholder: { type: 'accessor', value: x => x.isPlaceholder },
  widthUnits: 'pixels',
  widthScale: { type: 'number', value: 1, min: 0 },
  widthMinPixels: { type: 'number', value: 0, min: 0 },
  widthMaxPixels: { type: 'number', value: Number.MAX_SAFE_INTEGER, min: 0 },
};

class CurveLayer extends Layer {
  getShaders() {
    return super.getShaders({
      vs,
      fs,
      modules: [project, picking],
    });
  }
  initializeState() {
    const attributeManager = this.getAttributeManager();

    attributeManager.addInstanced({
      instanceSourcePositions: {
        size: 2,
        type: GL.DOUBLE,
        fp64: this.use64bitPositions(),
        transition: true,
        accessor: 'getSourcePosition',
      },
      instanceTargetPositions: {
        size: 2,
        type: GL.DOUBLE,
        fp64: this.use64bitPositions(),
        transition: true,
        accessor: 'getTargetPosition',
      },
      instanceSourceDirections: {
        size: 2,
        type: GL.DOUBLE,
        fp64: this.use64bitPositions(),
        transition: true,
        accessor: 'getSourceDirection',
      },
      instanceTargetDirections: {
        size: 2,
        type: GL.DOUBLE,
        fp64: this.use64bitPositions(),
        transition: true,
        accessor: 'getTargetDirection',
      },
      instanceLinkColors: {
        size: 3,
        type: GL.DOUBLE,
        transition: true,
        accessor: 'getColor',
      },
      instanceLinkWidths: {
        size: 1,
        type: GL.DOUBLE,
        transition: true,
        accessor: 'getWidth',
      },
      instanceLinkIsPlaceholder: {
        size: 1,
        type: GL.DOUBLE,
        transition: true,
        accessor: 'getLinkIsPlaceholder',
      },
    });
  }
  draw(input) {
    if (this.state.model) {
      const { widthUnits, widthScale, widthMinPixels, widthMaxPixels } =
        this.props;
      this.state.model
        .setUniforms({
          time: this.context.timeline.getTime(),
          opacity: 0.4,
          borderWidth: 0.0,
          numSegments: NUM_SEGMENTS,
          widthUnits: UNIT[widthUnits],
          widthScale,
          widthMinPixels,
          widthMaxPixels,
        })
        .draw();
    }
  }
  updateState({ props, oldProps, changeFlags }) {
    super.updateState({ props, oldProps, changeFlags });

    if (changeFlags.extensionsChanged) {
      const { gl } = this.context;
      this.state.model?.delete();
      this.state.model = this._getModel(gl);
      //this.state.linkModel = this._getLinkModel();
      this.getAttributeManager().invalidateAll();
    }
  }
  _getModel(gl) {
    // const {
    //   sourcePositions,
    //   targetPositions,
    //   sourceDirections,
    //   targetDirections,
    //   linkColors,
    //   linkThickness,
    // } = this.props;
    // const sourceBuffer = new Buffer(gl, new Float32Array(sourcePositions));
    // const targetBuffer = new Buffer(gl, new Float32Array(targetPositions));
    // const sourceDirectionBuffer = new Buffer(
    //   gl,
    //   new Float32Array(sourceDirections)
    // );
    // const targetDirectionBuffer = new Buffer(
    //   gl,
    //   new Float32Array(targetDirections)
    // );
    // const colorBuffer = new Buffer(gl, new Float32Array(linkColors));
    // const linkThicknessBuffer = new Buffer(gl, new Float32Array(linkThickness));
    /*
     *  (0, -1)-------------_(1, -1)
     *       |          _,-"  |
     *       o      _,-"      o
     *       |  _,-"          |
     *   (0, 1)"-------------(1, 1)
     */
    let positions = [];
    for (let i = 0; i <= NUM_SEGMENTS; i++) {
      positions = positions.concat([i, -1, 0, i, 1, 0]);
    }

    return new Model(gl, {
      ...this.getShaders(),
      id: this.props.id,
      geometry: new Geometry({
        drawMode: GL.TRIANGLE_STRIP,
        attributes: {
          positions: new Float32Array(positions),
        },
      }),
      // attributes: {
      //   instanceSourcePositions: [sourceBuffer, { divisor: 1 }],
      //   instanceTargetPositions: [targetBuffer, { divisor: 1 }],
      //   instanceSourceDirections: [sourceDirectionBuffer, { divisor: 1 }],
      //   instanceTargetDirections: [targetDirectionBuffer, { divisor: 1 }],
      //   instanceColors: [colorBuffer, { divisor: 1 }],
      //   instanceLinkThickness: [linkThicknessBuffer, { divisor: 1 }],
      // },
      // instanceCount: sourcePositions.length / 2,
      isInstanced: true,
    });
  }
}

CurveLayer.layerName = 'CurveLayer';
CurveLayer.defaultProps = defaultProps;

export { CurveLayer };
