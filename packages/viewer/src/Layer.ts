// Copyright (C) 2022 Andreas Rudenå
// Licensed under the MIT License

import { Model, CubeGeometry } from '@luma.gl/engine';
import { Buffer } from '@luma.gl/webgl';

// A test box
type Box = {
  x: number;
  y: number;
  z: number;
  w: number;
  h: number;
};

export type LayerProps = {
  id: string;
  type: string;
  data: Box[]; // many different types should be supported, match this with type
};

const vs = `
attribute vec2 positions;
attribute vec3 instanceColors;
attribute vec2 instancePositions;

varying vec3 vColor;

void main() {
  gl_Position = vec4(positions + instancePositions, 0.0, 1.0);
  vColor = instanceColors;
}
`;

const fs = `
varying vec3 vColor;
void main() {
  gl_FragColor = vec4(vColor, 1.0);
}
`;

export class Layer {
  gl: WebGLRenderingContext;
  props: LayerProps;
  model: Model;
  constructor(gl: WebGLRenderingContext, layerProps: LayerProps) {
    this.gl = gl;
    this.props = layerProps;
    this.update();
  }

  update() {
    this.model = this.createModel();
  }

  createModel() {
    const gl = this.gl;

    const positionBuffer = new Buffer(
      gl,
      new Float32Array([-0.5, -0.5, 0.5, -0.5, 0.0, 0.5])
    );

    const colorBuffer = new Buffer(
      gl,
      new Float32Array([
        Math.random(),
        Math.random(),
        Math.random(),
        Math.random(),
        Math.random(),
        Math.random(),
        Math.random(),
        Math.random(),
        Math.random(),
      ])
    );

    const model = new Model(gl, {
      id: this.props.id,
      vs,
      fs,
      geometry: new CubeGeometry(),
      attributes: {
        instancePositions: [positionBuffer, { divisor: 1 }],
        instanceColors: [colorBuffer, { divisor: 1 }],
      },
      uniforms: {},
      isInstanced: true,
      vertexCount: 3,
      instanceCount: 3,
    });
    return model;
  }

  render() {
    if (this.model) {
      this.model.draw();
    }
  }
}
