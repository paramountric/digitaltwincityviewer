// Copyright (C) 2022 Andreas Rudenå
// Licensed under the MIT License

import { Model } from '@luma.gl/engine';
import { Buffer } from '@luma.gl/webgl';
import GL from '@luma.gl/constants';
import { project, picking } from '@luma.gl/shadertools';
import { Matrix4 } from '@math.gl/core';
import { Feature, Position } from 'geojson';
import { Layer } from './Layer';
import { Point } from '../lib/Point';
import { Viewer } from '../lib/Viewer';
import { triangulate, Polygon, MultiPolygon } from '../utils/polygon';

export type GeoJsonBuildingLayerProps = {
  id: string;
  type: 'geojson';
  data: Feature[]; // geojson buildings
  showPoints?: boolean;
  showLines?: boolean;
  showPolygons?: boolean;
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

// For experimentation the GeoJsonBuildingLayer is specialised layer for 2D footprints (consider extrusion)
// One idea could be to create many different layers and throw them in depending on what data is loaded and the state of the viewer (zoom level)
// The "building layer" is going to be much more advanced as the following concepts need to be taken into consideration:
// - LOD according to CityGML
// - Different data types such as point cloud, shape files, 3D-models, etc
// - Different disciplines such as energy model, structural model, etc
// One approach to solve this could be using 3D Tiles or similar concept (so a tree/graph of layers?)
export class GeoJsonBuildingLayer extends Layer {
  id: string;
  gl: WebGLRenderingContext;
  props: GeoJsonBuildingLayerProps;
  models: Model[];
  model: Model;
  constructor(viewer: Viewer, layerProps: GeoJsonBuildingLayerProps) {
    super(viewer, { id: layerProps.id });
    this.id = layerProps.id;
    this.update(layerProps);
  }

  getMultiPolygonData(multiPolygon: Position[][][], data) {
    for (const polygon of multiPolygon) {
      this.getPolygonData(polygon, data);
    }
  }

  // note: a polygon is multipolygon due to holes
  getPolygonData(polygon: Polygon | MultiPolygon | Position[][], data) {
    const [centerX, centerY] = this.transform.pointToPixelPoint(
      Point.fromLngLat(...this.transform.cityLngLat)
    );
    const multiPolygon =
      Array.isArray(polygon[0]) && Number.isFinite(polygon[0][0])
        ? [polygon]
        : polygon;
    const triangulateInput = [];
    for (const poly of multiPolygon) {
      const points = [];
      for (const point of poly) {
        const [x, y] = this.transform.pointToPixelPoint(
          Point.fromLngLat(point[0], point[1])
        );
        points.push([x - centerX, y - centerY]);
      }
      triangulateInput.push(points);
    }
    const { vertices, indices, holes } = triangulate(
      triangulateInput as MultiPolygon
    );
    for (let i = 0; i < indices.length; i++) {
      indices[i] = indices[i] + data.indexCount;
    }
    // todo: figure out dimensions 2 or 3
    const dimensions = 2;
    const numVertices = vertices.length / dimensions;
    const vertexStart = data.vertices.length / dimensions;
    data.indexCount += numVertices;
    data.indices = data.indices.concat(indices);
    data.vertices = data.vertices.concat(vertices);
    const polygonStarts = [...Array(numVertices - 1).fill(1), 0];
    if (holes) {
      for (const holeIndex of holes) {
        const holeEnd = vertexStart + holeIndex / dimensions - 1;
        polygonStarts[holeEnd] = 0;
      }
    }
    data.polygonStarts = data.polygonStarts.concat(polygonStarts);
    // numInstances will increment in main loop for each feature
    const instanceColor = this.indexToColor(data.numInstances);
    const pickingColors = Array(numVertices)
      .fill(null)
      .reduce(d => [...d, ...instanceColor], []);
    data.pickingColors = data.pickingColors.concat(pickingColors);
  }

  generateAttributeData(
    layerProps: GeoJsonBuildingLayerProps
  ): LayerAttributeData | null {
    const { showPoints, showLines, showPolygons, data } = layerProps;
    if (!showPoints && !showLines && !showPolygons) {
      return null;
    }

    const attributeData = {
      vertices: [],
      indices: [],
      indexCount: 0,
      numInstances: 0,
      polygonStarts: [],
      pickingColors: [],
    };
    for (const feature of data) {
      if (feature.geometry.type === 'Polygon') {
        this.getPolygonData(feature.geometry.coordinates, attributeData);
        attributeData.numInstances++;
      } else if (feature.geometry.type === 'MultiPolygon') {
        this.getMultiPolygonData(feature.geometry.coordinates, attributeData);
        attributeData.numInstances++;
      }
    }

    return attributeData;
  }

  update(layerProps: GeoJsonBuildingLayerProps) {
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
