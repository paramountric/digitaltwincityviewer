import { vec3, mat4 } from 'gl-matrix';
import proj4 from 'proj4';

proj4.defs(
  'EPSG:3008',
  '+proj=tmerc +lat_0=0 +lon_0=13.5 +k=1 +x_0=150000 +y_0=0 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs'
);
proj4.defs(
  'EPSG:3006',
  '+proj=utm +zone=33 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs'
);

proj4.defs(
  'EPSG:31256',
  '+proj=tmerc +lat_0=0 +lon_0=16.33333333333333 +k=1 +x_0=0 +y_0=-5000000 +ellps=bessel +towgs84=577.326,90.129,463.919,5.137,1.474,5.297,2.4232 +units=m +no_defs'
);

// Not sure if this is supposed to be CityObject?
// In some files a subdivision of CityObject is wanted in the viewer -> is this a badly designed CityGML file?
// = are CityObject the least pickable object in the viewer? For example a bldg:Building are boundedBy surfaces -> the surfaces should be pickable?
type SemanticObject = {
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

  mat4.fromTranslation(modelMatrix, translate);

  if (refLat) {
    const altScale = 1 + Math.cos((refLat * Math.PI) / 180);
    mat4.scale(modelMatrix, modelMatrix, [1, 1, altScale]);
  }

  return modelMatrix;
}

export function projectCoordinate(x, y, fromProj = 'EPSG:3008') {
  return proj4(fromProj, 'EPSG:3857', [x, y]);
}

export function projectVertices(vertices, fromProj) {
  const projectedVertices = [];
  for (const vertex of vertices) {
    const projectedCoordinate = projectCoordinate(
      vertex[0],
      vertex[1],
      fromProj
    );
    projectedVertices.push([
      projectedCoordinate[0],
      projectedCoordinate[1],
      vertex[2],
    ]);
  }
  return projectedVertices;
}

export function projectExtent(extent, fromProj?) {
  const projectedExtentMin = projectCoordinate(extent[0], extent[1], fromProj);
  const projectedExtentMax = projectCoordinate(extent[3], extent[4], fromProj);
  return [...projectedExtentMin, extent[2], ...projectedExtentMax, extent[5]];
}

export function getLayerPosition(extent, options: LayerMatrixOptions) {
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
