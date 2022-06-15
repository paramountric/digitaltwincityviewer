// This is a modification of SimpleMeshLayer
// Copyright (c) 2015 Uber Technologies, Inc. (MIT)
// However, now it's been changed so much that it does not make sense to use an instanced layer anymore
// Either, use the instanced layer features or just go for raw attribute based layer

import { Layer, project32, phongLighting, picking, log } from '@deck.gl/core';
import GL from '@luma.gl/constants';
import { Model, Geometry, Texture2D, isWebGL2 } from '@luma.gl/core';
import { hasFeature, FEATURES } from '@luma.gl/webgl';

import vs from './building-surface-mesh-layer-vertex.glsl';
import fs from './building-surface-mesh-layer-fragment.glsl';

function validateGeometryAttributes(attributes, useMeshColors) {
  const hasColorAttribute = attributes.COLOR_0 || attributes.colors;
  const useColorAttribute = hasColorAttribute && useMeshColors;
  if (!useColorAttribute) {
    attributes.colors = { constant: true, value: new Float32Array([1, 1, 1]) };
  }
  log.assert(
    attributes.positions || attributes.POSITION,
    'no "postions" or "POSITION" attribute in mesh'
  );
}

/*
 * Convert mesh data into geometry
 * @returns {Geometry} geometry
 */
function getGeometry(data, useMeshColors) {
  if (data.attributes) {
    validateGeometryAttributes(data.attributes, useMeshColors);
    if (data instanceof Geometry) {
      return data;
    } else {
      return new Geometry(data);
    }
  } else if (data.positions || data.POSITION) {
    validateGeometryAttributes(data, useMeshColors);
    return new Geometry({
      attributes: data,
    });
  }
  throw Error('Invalid mesh');
}

const DEFAULT_COLOR = [0, 0, 0, 255];

const defaultProps = {
  mesh: { value: null, type: 'object', async: true },
  texture: { type: 'image', value: null, async: true },
  sizeScale: { type: 'number', value: 1, min: 0 },
  // Whether the color attribute in a mesh will be used
  // This prop will be removed and set to true in next major release
  _useMeshColors: { type: 'boolean', value: false },

  // _instanced is a hack to use world position instead of meter offsets in mesh
  // TODO - formalize API
  _instanced: true,
  // NOTE(Tarek): Quick and dirty wireframe. Just draws
  // the same mesh with LINE_STRIPS. Won't follow edges
  // of the original mesh.
  wireframe: false,
  // Optional material for 'lighting' shader module
  material: true,
  getPosition: { type: 'accessor', value: x => x.position },
  getColor: { type: 'accessor', value: DEFAULT_COLOR },

  // yaw, pitch and roll are in degrees
  // https://en.wikipedia.org/wiki/Euler_angles
  // [pitch, yaw, roll]
  getOrientation: { type: 'accessor', value: [0, 0, 0] },
  getScale: { type: 'accessor', value: [1, 1, 1] },
  getTranslation: { type: 'accessor', value: [0, 0, 0] },
  // 4x4 matrix
  getTransformMatrix: { type: 'accessor', value: [] },
  waterLevel: 10,
};

export default class BuildingSurfaceLayer extends Layer {
  getShaders() {
    const transpileToGLSL100 = !isWebGL2(this.context.gl);

    const defines = {};

    if (hasFeature(this.context.gl, FEATURES.GLSL_DERIVATIVES)) {
      defines.DERIVATIVES_AVAILABLE = 1;
    }

    return super.getShaders({
      vs: vs[0],
      fs: fs[0],
      modules: [project32, phongLighting, picking],
      transpileToGLSL100,
      defines,
    });
  }

  initializeState() {
    const attributeManager = this.getAttributeManager();

    attributeManager.add({
      customPickingColors: {
        size: 3,
        type: GL.UNSIGNED_BYTE,
        update: this.calculatePickingColors,
      },
    });

    attributeManager.addInstanced({
      instancePositions: {
        transition: true,
        type: GL.DOUBLE,
        fp64: this.use64bitPositions(),
        size: 3,
        accessor: 'getPosition',
      },
      instanceColors: {
        type: GL.UNSIGNED_BYTE,
        transition: true,
        size: this.props.colorFormat.length,
        normalized: true,
        accessor: 'getColor',
        defaultValue: [0, 0, 0, 255],
      },
    });

    this.setState({
      // Avoid luma.gl's missing uniform warning
      // TODO - add feature to luma.gl to specify ignored uniforms?
      emptyTexture: new Texture2D(this.context.gl, {
        data: new Uint8Array(4),
        width: 1,
        height: 1,
      }),
    });
  }

  updateState({ props, oldProps, changeFlags }) {
    super.updateState({ props, oldProps, changeFlags });

    if (props.mesh !== oldProps.mesh || changeFlags.extensionsChanged) {
      if (this.state.model) {
        this.state.model.delete();
      }
      if (props.mesh) {
        this.state.model = this.getModel(props.mesh);

        const attributes = props.mesh.attributes || props.mesh;
        this.setState({
          hasNormals: Boolean(attributes.NORMAL || attributes.normals),
        });
      }
      this.getAttributeManager().invalidateAll();
    }

    if (props.texture !== oldProps.texture) {
      this.setTexture(props.texture);
    }

    if (this.state.model) {
      this.state.model.setDrawMode(
        this.props.wireframe ? GL.LINE_STRIP : GL.TRIANGLES
      );
    }
  }

  finalizeState() {
    super.finalizeState();

    this.state.emptyTexture.delete();
  }

  draw({ uniforms }) {
    if (!this.state.model) {
      return;
    }

    const { sizeScale } = this.props;

    this.state.model
      .setUniforms(uniforms)
      .setUniforms({
        pickingHighlightColor: [150, 150, 150, 150],
        sizeScale,
        composeModelMatrix: true,
        flatShading: !this.state.hasNormals,
      })
      .draw();
  }

  getModel(mesh) {
    const model = new Model(this.context.gl, {
      ...this.getShaders(),
      id: this.props.id,
      geometry: getGeometry(mesh, this.props._useMeshColors),
      isInstanced: true,
    });

    const { texture } = this.props;
    const { emptyTexture } = this.state;
    model.setUniforms({
      sampler: texture || emptyTexture,
      hasTexture: Boolean(texture),
    });

    return model;
  }

  setTexture(texture) {
    const { emptyTexture, model } = this.state;

    // props.mesh may not be ready at this time.
    // The sampler will be set when `getModel` is called
    if (model) {
      model.setUniforms({
        sampler: texture || emptyTexture,
        hasTexture: Boolean(texture),
      });
    }
  }

  calculatePickingColors(attribute) {
    const { data } = this.props;
    attribute.value = new Uint8Array(data[0].customPickingColors);
  }
}

BuildingSurfaceLayer.layerName = 'BuildingSurfaceLayer';
BuildingSurfaceLayer.defaultProps = defaultProps;
