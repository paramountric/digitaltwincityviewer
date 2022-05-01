// Copyright (C) 2022 Andreas Rudenå
// Licensed under the MIT License

import { Model } from '@luma.gl/engine';
import { Buffer } from '@luma.gl/webgl';
import GL from '@luma.gl/constants';
import { project, picking } from '@luma.gl/shadertools';
import { Matrix4 } from '@math.gl/core';
import { Layer } from './Layer';
import { Point } from '../lib/Point';
import { Viewer } from '../luma/Viewer';
import { triangulate, Polygon, MultiPolygon } from '../utils/polygon';

// todo: import the types from schema (WIP)
type CityObject = {
  id: string;
};

export type CityGmlLayerProps = {
  id: string;
  type: 'citygml';
  data: CityObject[];
};

type LayerAttributeData = {
  vertices: number[];
  indices: number[];
  numInstances: number;
  polygonStarts: number[];
  pickingColors: number[];
};

const vs = `
attribute vec2 positions;
attribute vec3 nextPositions;
attribute vec2 vertexPositions;
attribute float vertexValid;
attribute vec3 pickingColors;

uniform vec4 projectionOffset;

void main() {
  vec4 pos = vec4(positions, 0., 1.0);
  //vec3 pos = project_to_clipspace(pos) * modelMatrix;
  gl_Position = viewProjectionMatrix * modelMatrix * pos;// + projectionOffset;
  picking_setPickingColor(pickingColors);
}
`;

const fs = `
void main() {
  gl_FragColor = vec4(0.5, 0.5, 0.5, 1.0);
  gl_FragColor = picking_filterColor(gl_FragColor);
}
`;

// This is an experimental layer to figure out the the CityGML import in a very brute forced way
// The question is how to split the layers between domain, discipline, data formats.
// It should be easy to import data, yet be rather efficent
export class CityGmlLayer extends Layer {
  id: string;
  gl: WebGLRenderingContext;
  props: CityGmlLayerProps;
  models: Model[];
  model: Model;
  constructor(viewer: Viewer, layerProps: CityGmlLayerProps) {
    super(viewer, { id: layerProps.id });
    this.id = layerProps.id;
    this.update(layerProps);
  }

  generateAttributeData(
    layerProps: CityGmlLayerProps
  ): LayerAttributeData | null {
    // todo: figure out an efficient way to parse the citygml data
    const attributeData = {
      vertices: [],
      indices: [],
      indexCount: 0,
      numInstances: 0,
      polygonStarts: [],
      pickingColors: [],
    };

    return attributeData;
  }

  update(layerProps: CityGmlLayerProps) {
    const data = this.generateAttributeData(layerProps);
    if (data) {
      this.model = this.createModel(data);
    }
  }

  createModel({
    vertices,
    indices,
    numInstances,
    polygonStarts,
    pickingColors,
  }) {
    const gl = this.gl;

    const positionsBuffer = new Buffer(gl, new Float32Array(vertices));
    const pickingColorBuffer = new Buffer(gl, new Float32Array(pickingColors));

    const model = new Model(gl, {
      id: 'geojson',
      vs,
      fs,
      modules: [project, picking],
      attributes: {
        vertexPositions: new Float32Array([0, 1]),
        positions: [positionsBuffer, { size: 2 }],
        instancePositions: [positionsBuffer, { size: 2, divisor: 1 }],
        nextPositions: [
          positionsBuffer,
          { size: 2, divisor: 1, vertexOffset: 1 },
        ],
        polygonStarts: [
          new Buffer(gl, new Uint8Array(polygonStarts)),
          { divisor: 1, size: 1 },
        ],
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
        pickingColors: [pickingColorBuffer, { divisor: 0, size: 3 }],
        instancePickingColors: [pickingColorBuffer, { divisor: 1 }],
      },
      vertexCount: indices.length,
      instanceCount: numInstances,
    });
    return model;
  }

  render({ moduleSettings = {}, parameters = {} }) {
    if (this.model) {
      const modelMatrix = new Matrix4();
      //modelMatrix.rotateZ(Math.random());
      //modelMatrix.scale(1);
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
