// Copyright (C) 2022 Andreas Rudenå
// Licensed under the MIT License

import { Model } from '@luma.gl/engine';
import { Buffer } from '@luma.gl/webgl';
import { FeatureCollection } from 'geojson';
import { Transform } from './Transform';
import { Viewer } from './Viewer';

export type GeoJsonLayerProps = {
  id: string;
  featureCollection: FeatureCollection;
  showPoints: boolean;
  showLines: boolean;
  showPolygons: boolean;
};

type LayerAttributeData = {
  positions: number[];
  polygonStartPositions: number[];
};

const vs = `
attribute vec2 positions;
attribute vec2 instancePositions;

uniform mat4 modelMatrix;
uniform mat4 viewProjectionMatrix;
uniform mat4 viewMatrix;
uniform mat4 projectionMatrix;
uniform vec4 projectionOffset;

void main() {
  vec4 pos = vec4(positions + instancePositions, 0.0, 1.0);
  //gl_Position = project_to_clipspace(pos) * modelMatrix;
  gl_Position = viewProjectionMatrix * modelMatrix * pos;// + projectionOffset;
  vColor = instanceColors;
}
`;

const fs = `
void main() {
  gl_FragColor = vec4(0.5, 0.5, 0.5, 1.0);
}
`;

// ! note that this class is in prototype stage. Todo: inhererit from a base class, extract reusable functionality to lib
// ? keep general comments and functionality in the Layer class even if temporarily replicated here
export class GeoJsonLayer {
  gl: WebGLRenderingContext;
  transform: Transform;
  props: GeoJsonLayerProps;
  models: Model[];
  constructor(viewer: Viewer, layerProps: GeoJsonLayerProps) {
    this.gl = viewer.context.gl;
    this.transform = viewer.transform;
    this.props = layerProps;
    this.update();
  }

  generateAttributeData(
    featureCollection: FeatureCollection
  ): LayerAttributeData | null {
    const { showPoints, showLines, showPolygons } = this.props;
    if (!showPoints || !showLines || !showPolygons) {
      return null;
    }
    const attributeData: LayerAttributeData = {
      positions: [],
      polygonStartPositions: [],
    };

    return attributeData;
  }

  update() {
    const data = this.generateAttributeData(this.props.featureCollection);
    if (data) {
      this.models = this.createModels(data);
    }
  }

  createModels({ positions }) {
    const gl = this.gl;

    const model = new Model(gl, {
      id: this.props.id,
      vs,
      fs,
      attributes: {
        instancePositions: [
          new Buffer(gl, new Float32Array(positions)),
          { divisor: 1 },
        ],
      },
      uniforms: {},
    });
    return [model];
  }

  render() {
    if (this.models.length) {
      for (const model of this.models) {
        model.draw();
      }
    }
  }
}
