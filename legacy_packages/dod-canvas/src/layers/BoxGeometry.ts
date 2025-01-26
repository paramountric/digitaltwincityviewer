import { mat4, quat, vec3 } from 'gl-matrix';
//import { Geometry } from '@luma.gl/engine';
import { uid } from '@luma.gl/webgl';

// * this is a modified version of https://github.com/visgl/luma.gl/blob/master/modules/engine/src/geometries/cube-geometry.ts
// Copyright Uber MIT

// ? how to use this class:
// use for modeling as individual elements, create a mesh from the box and use as instance together with modelMatrix = needs typed array
// use for creating a composite mesh: collect many instances of the box and then merge with staticProps to create one mesh
// todo: use typed array in iterations to optimize attribute iterations

// prettier-ignore
const CUBE_INDICES = [
  0, 1, 2, 0, 2, 3,
  4, 5, 6, 4, 6, 7,
  8, 9, 10, 8, 10, 11,
  12, 13, 14, 12, 14, 15,
  16, 17, 18, 16, 18, 19,
  20, 21, 22, 20, 22, 23
];

// prettier-ignore
// const CUBE_POSITIONS_CENTERED = [
//   -0.5,  -0.5,  0.5,  0.5,  -0.5,  0.5,  0.5,  0.5,  0.5,  -0.5,  0.5,  0.5,
//   -0.5,  -0.5,  -0.5,  -0.5,  0.5,  -0.5,  0.5,  0.5,  -0.5,  0.5,  -0.5,  -0.5,
//   -0.5,  0.5,  -0.5,  -0.5,  0.5,  0.5,  0.5,  0.5,  0.5,  0.5,  0.5,  -0.5,
//   -0.5,  -0.5,  -0.5,  0.5,  -0.5,  -0.5,  0.5,  -0.5,  0.5,  -0.5,  -0.5,  0.5,
//   0.5,  -0.5,  -0.5,  0.5,  0.5,  -0.5,  0.5,  0.5,  0.5,  0.5,  -0.5,  0.5,
//   -0.5,  -0.5,  -0.5,  -0.5,  -0.5,  0.5,  -0.5,  0.5,  0.5,  -0.5,  0.5,  -0.5
// ];

// ! Note: when modeling, it's easier to draw with unit cubes from 0,0 and then translate half total with of mesh
// prettier-ignore
const CUBE_POSITIONS = new Float32Array([
  0,  0,  1, 1,  0,  1,  1,  1,  1,  0,  1,  1,
  0,  0,  0,  0,  1,  0,  1,  1,  0,  1,  0,  0,
  0,  1,  0,  0,  1,  1,  1,  1,  1,  1,  1,  0,
  0,  0,  0,  1,  0,  0,  1,  0,  1,  0,  0,  1,
  1,  0,  0,  1,  1,  0,  1,  1,  1,  1,  0,  1,
  0,  0,  0,  0,  0,  1,  0,  1,  1,  0,  1,  0
]);

// prettier-ignore
const CUBE_NORMALS = [
  // Front face
  0,  0,  1,  0,  0,  1,  0,  0,  1,  0,  0,  1,
  // Back face
  0,  0,  -1,  0,  0,  -1,  0,  0,  -1,  0,  0,  -1,
  // Top face
  0,  1,  0,  0,  1,  0,  0,  1,  0,  0,  1,  0,
  // Bottom face
  0,  -1,  0,  0,  -1,  0,  0,  -1,  0,  0,  -1,  0,
  // Right face
  1,  0,  0,  1,  0,  0,  1,  0,  0,  1,  0,  0,
  // Left face
  -1,  0,  0,  -1,  0,  0,  -1,  0,  0,  -1,  0,  0
];

// prettier-ignore
const CUBE_TEX_COORDS = [
  // Front face
  0,  0,  1,  0,  1,  1,  0,  1,
  // Back face
  1,  0,  1,  1,  0,  1,  0,  0,
  // Top face
  0,  1,  0,  0,  1,  0,  1,  1,
  // Bottom face
  1,  1,  0,  1,  0,  0,  1,  0,
  // Right face
  1,  0,  1,  1,  0,  1,  0,  0,
  // Left face
  0,  0,  1,  0,  1,  1,  0,  1
];

const nonTypedAttributes = {
  positions: CUBE_POSITIONS,
  normals: CUBE_NORMALS,
  texCoords: CUBE_TEX_COORDS,
};

const nonTypedIndices = CUBE_INDICES;

const ATTRIBUTES = {
  POSITION: { size: 3, value: new Float32Array(CUBE_POSITIONS) },
  NORMAL: { size: 3, value: new Float32Array(CUBE_NORMALS) },
  TEXCOORD_0: { size: 2, value: new Float32Array(CUBE_TEX_COORDS) },
};

export default class BoxGeometry {
  id: string;
  attributes: any;
  indices: any;
  color: number[];
  translate: number[];
  rotate: number[];
  scale: number[];
  rotateOrigin: number[];
  modelMatrix: mat4;
  constructor({
    id = uid('box-geometry'),
    color = [0, 0, 0],
    //drawMode,
    translate = [0, 0, 0],
    rotate = [0, 0, 0],
    scale = [1, 1, 1],
    rotateOrigin = [0, 0, 0],
    modelMatrix = mat4.create(),
    isCentered = false, // translate is thought from center of box, set to false to add the box add translate = bottom left corner
  } = {}) {
    this.id = id;
    this.attributes = ATTRIBUTES;
    this.indices = { size: 1, value: new Uint16Array(CUBE_INDICES) };
    //this.drawMode = drawMode;
    this.color = color;
    // if centered, add half size to translate
    this.translate = isCentered
      ? translate
      : (vec3.add(vec3.create(), translate as vec3, [
          scale[0] * 0.5,
          scale[1] * 0.5,
          0,
        ]) as number[]);
    this.rotate = rotate;
    this.scale = scale;
    this.rotateOrigin = rotateOrigin;
    this.modelMatrix = new Float32Array(modelMatrix);
    this.updateModelMatrix(modelMatrix);
  }

  updateModelMatrix(parentMatrix) {
    const rotate = quat.fromEuler(
      quat.create(),
      this.rotate[0],
      this.rotate[1],
      this.rotate[2]
    );
    this.modelMatrix = mat4.fromRotationTranslationScaleOrigin(
      mat4.create(),
      rotate,
      this.translate as vec3,
      this.scale as vec3,
      this.rotateOrigin as vec3
    );
    if (parentMatrix) {
      this.modelMatrix = mat4.multiply(
        mat4.create(),
        parentMatrix,
        this.modelMatrix
      );
    }
  }

  dynamicProps(parentMatrix) {
    const { id, color } = this;
    const modelMatrix = parentMatrix
      ? mat4.multiply(mat4.create(), parentMatrix, this.modelMatrix)
      : this.modelMatrix;

    return {
      id,
      color,
      modelMatrix,
    };
  }

  // converts positions using the instance modelMatrix
  // use this to compile parametric mesh (not when using modelMatrix together with instanced box mesh)
  staticProps(parentMatrix, vertexStart) {
    const { modelMatrix } = this.dynamicProps(parentMatrix);
    // ! note: non typed attributes are used, but types are put on the instance in constructor
    const attributes = nonTypedAttributes;
    const positions = [];
    for (let i = 0; i < attributes.positions.length; i += 3) {
      const pos = [
        attributes.positions[i],
        attributes.positions[i + 1],
        attributes.positions[i + 2],
      ];
      positions.push(
        ...vec3.transformMat4(vec3.create(), pos as vec3, modelMatrix)
      );
    }

    const indices = nonTypedIndices.map(ind => {
      return ind + vertexStart;
    });
    return {
      positions,
      indices,
      normals: attributes.normals,
      texCoords: attributes.texCoords,
    };
  }

  clone() {
    return new BoxGeometry({
      id: `${this.id}-clone`,
      color: this.color,
      translate: this.translate,
      rotate: this.rotate,
      scale: this.scale,
    });
  }
}
