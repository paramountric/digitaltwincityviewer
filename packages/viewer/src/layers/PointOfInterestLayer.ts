// Copyright (C) 2022 Andreas Rudenå
// Licensed under the MIT License

import { Model } from '@luma.gl/engine';
import GL from '@luma.gl/constants';
import { Buffer } from '@luma.gl/webgl';
import { project, picking } from '@luma.gl/shadertools';
import { Matrix4 } from '@math.gl/core';
import { Layer } from './Layer';
import { Viewer } from '../luma/Viewer';

type PointOfInterest = {
  x: number;
  y: number;
  z?: number;
};

export type PointOfInterestLayerProps = {
  id: string;
  type: 'pointOfInterest';
  data: PointOfInterest[];
};

const vs = `
attribute vec3 positions;
attribute vec3 instancePositions;
attribute vec3 instancePickingColors;

void main() {
  vec4 pos = vec4(instancePositions + positions, 1.0);
  gl_Position = viewProjectionMatrix * modelMatrix * pos;
  picking_setPickingColor(instancePickingColors);
}
`;

const fs = `
void main() {
  gl_FragColor = vec4(1., 0., 0., 1.0);
  gl_FragColor = picking_filterColor(gl_FragColor);
}
`;

export class PointOfInterestLayer extends Layer {
  id: string;
  gl: WebGLRenderingContext;
  props: PointOfInterestLayerProps;
  model: Model;
  constructor(viewer: Viewer, layerProps: PointOfInterestLayerProps) {
    super(viewer, { id: layerProps.id });
    this.id = layerProps.id;
    this.update(layerProps);
  }

  generateAttributeData(layerProps) {
    let instancePositions = [];
    for (const point of layerProps.data) {
      const { x, y, z = 0 } = point;
      instancePositions = instancePositions.concat([x, y, z]);
    }
    return {
      instancePositions,
    };
  }

  update(layerProps: PointOfInterestLayerProps) {
    const { data } = layerProps;
    if (data) {
      const attributes = this.generateAttributeData(layerProps);
      this.model = this.createModel({ attributes });
    }
  }

  createModel({ attributes }) {
    const gl = this.gl;

    const positions = [-1, -1, 0, 1, -1, 0, 1, 1, 0, -1, 1, 0];
    const { instancePositions } = attributes;

    const numInstances = 3;

    return new Model(gl, {
      vs,
      fs,
      modules: [project, picking],
      id: this.id,
      drawMode: GL.TRIANGLE_FAN,
      attributes: {
        positions: new Buffer(gl, new Float32Array(positions)),
        instancePositions: [
          new Buffer(gl, new Float32Array(instancePositions)),
          { divisor: 1 },
        ],
        instancePickingColors: [
          new Buffer(
            gl,
            new Float32Array(this.getInstancePickingColors(numInstances))
          ),
          { divisor: 1 },
        ],
      },
      vertexCount: positions.length / 3,
      instanceCount: numInstances,
    });
  }

  render({ moduleSettings = {}, parameters = {} }) {
    if (this.model) {
      const modelMatrix = new Matrix4();
      //modelMatrix.rotateZ(Math.random());
      modelMatrix.scale(1);
      this.model
        .setUniforms(this.transform.getUniforms())
        .setUniforms({
          modelMatrix,
        })
        .draw({
          moduleSettings,
          parameters,
        });
    }
  }
}
