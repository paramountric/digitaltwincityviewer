// Copyright (C) 2022 Andreas Rudenå
// Licensed under the MIT License

import { Model } from '@luma.gl/engine';
import { Buffer } from '@luma.gl/webgl';
import GL from '@luma.gl/constants';
import { Layer, LayerState, project32 } from '@deck.gl/core';
import { SimpleMeshLayer } from '@deck.gl/mesh-layers';

console.log(Layer);

export type SurfaceMeshLayerProps = {
  id: string;
  type: 'surface-mesh';
  data: {
    vertices: number[];
    indices: number[];
  };
};

const vs = `
attribute vec2 positions;

void main() {
  vec4 pos = vec4(positions, 0., 1.0);
  //vec3 pos = project_to_clipspace(pos) * modelMatrix;
  gl_Position = viewProjectionMatrix * modelMatrix * pos;
}
`;

const fs = `
void main() {
  gl_FragColor = vec4(0.5, 0.5, 0.5, 1.0);
}
`;

export class SurfaceMeshLayer extends SimpleMeshLayer {
  state: LayerState;
  context: any;
  model: Model;
  constructor(props) {
    super(props);
  }
  updateState({ props }) {
    const { data } = props;
    if (this.state.model) {
      this.state.model = this.getModel(data);
    }
  }

  getModel({ vertices, indices }) {
    const { gl } = this.context;
    const positionsBuffer = new Buffer(gl, new Float32Array(vertices));

    const model = new Model(this.context.gl, {
      id: 'surface-mesh',
      vs,
      fs,
      modules: [project32],
      attributes: {
        positions: [positionsBuffer, { size: 2 }],
        indices: [
          new Buffer(gl, {
            data: new Uint32Array(indices),
            target: GL.ELEMENT_ARRAY_BUFFER,
          }),
          {
            size: 1,
            isIndexed: true,
          },
        ],
      },
      vertexCount: indices.length,
    });
    return model;
  }
}
