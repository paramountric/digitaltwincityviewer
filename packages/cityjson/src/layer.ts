import { vec3, mat4 } from 'gl-matrix';

// Not sure if this is supposed to be CityObject?
// In some files a subdivision of CityObject is wanted in the viewer -> is this a badly designed CityGML file?
// = are CityObject the least pickable object in the viewer? For example a bldg:Building are boundedBy surfaces -> the surfaces should be pickable?
type SemanticObject = {
  cityObjectId?: string;
  id: string;
  type: string;
  properties: any;
};

// These props are the part of viewer layer props that needs to be set for each layer of CityJSON data
export type LayerProps = {
  data: {
    vertices: number[];
    indices: number[];
    colors: number[];
    customPickingColors: number[];
    objects: SemanticObject[];
  };
  modelMatrix: mat4;
  center: vec3;
  min: vec3;
  max: vec3;
  width: number;
  height: number;
  autoHighlight: boolean;
  highlightColor: number[]; // rgb or rgba 0-255
};

export type LayerMatrixOptions = {
  refLat?: number;
  addZ?: number;
};

export function getLayerMatrix(extent, { refLat, addZ }: LayerMatrixOptions) {
  const modelMatrix = mat4.create();

  if (refLat) {
    const altScale = 1 + Math.cos((refLat * Math.PI) / 180);
    mat4.scale(modelMatrix, modelMatrix, [1, 1, altScale]);
  }

  const min = [extent[0], extent[1], extent[2]] as vec3;
  const max = [extent[3], extent[4], extent[5]] as vec3;

  const size = vec3.sub(vec3.create(), max as vec3, min as vec3);
  const offset = vec3.add(
    vec3.create(),
    min as vec3,
    vec3.scale(vec3.create(), size, 0.5)
  );
  const translate = vec3.negate(vec3.create(), offset);
  if (addZ) {
    translate[2] += addZ;
  }

  mat4.translate(modelMatrix, modelMatrix, translate);

  return modelMatrix;
}

export function getLayerPosition(
  extent: [number, number, number, number, number, number],
  options: LayerMatrixOptions
) {
  const min = [extent[0], extent[1], extent[2]] as vec3;
  const max = [extent[3], extent[4], extent[5]] as vec3;
  const modelMatrix = getLayerMatrix(extent, options);
  const size = vec3.sub(vec3.create(), max as vec3, min as vec3);
  const center = vec3.add(
    vec3.create(),
    min as vec3,
    vec3.scale(vec3.create(), size, 0.5)
  );

  return {
    min,
    max,
    width: size[0],
    height: size[1],
    center,
    modelMatrix,
  };
}
