// Copyright (C) 2022 Andreas Rudenå
// Licensed under the MIT License

import { Model, CubeGeometry } from '@luma.gl/engine';
import { Buffer } from '@luma.gl/webgl';
import { Matrix4 } from '@math.gl/core';
import { Transform } from './Transform';
import { Viewer } from './Viewer';

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

uniform mat4 modelMatrix;
uniform mat4 viewProjectionMatrix;
uniform mat4 viewMatrix;
uniform mat4 projectionMatrix;
uniform vec4 projectionOffset;

varying vec3 vColor;

void main() {
  vec4 pos = vec4(positions + instancePositions, 0.0, 1.0);
  //gl_Position = project_to_clipspace(pos) * modelMatrix;
  gl_Position = viewProjectionMatrix * modelMatrix * pos;// + projectionOffset;
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
  transform: Transform;
  props: LayerProps;
  model: Model;
  // todo: consider if sending in viewer instance in layer is good. Either the Layer class needs the Viewer instance, or the context parameters needed can be sent separately (Layer might need more things from Viewer later)
  constructor(viewer: Viewer, layerProps: LayerProps) {
    this.gl = viewer.context.gl;
    this.transform = viewer.transform;
    this.props = layerProps;
    this.update();
  }

  update() {
    this.model = this.createModel();
  }

  createModel() {
    const gl = this.gl;

    const positionBuffer = new Buffer(gl, new Float32Array([0, 0, 1, 1, 2, 2]));

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
      const modelMatrix = new Matrix4();
      //modelMatrix.rotateZ(Math.random());
      modelMatrix.scale(1);
      this.model
        .setUniforms(this.transform.getUniforms())
        .setUniforms({
          modelMatrix,
        })
        .draw();
    }
  }
}
