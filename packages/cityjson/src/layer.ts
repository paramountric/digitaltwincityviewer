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

export function getModelMatrix(extent, addZ?: number) {
  const min = [extent[0], extent[1], extent[2]] as vec3;
  const max = [extent[3], extent[4], extent[5]] as vec3;

  const size = vec3.sub(vec3.create(), max as vec3, min as vec3);
  const offset = vec3.add(
    vec3.create(),
    min as vec3,
    vec3.scale(vec3.create(), size, 0.5)
  );
  const position = vec3.negate(vec3.create(), offset);
  if (addZ) {
    position[2] += addZ;
  }

  const modelMatrix = mat4.fromTranslation(mat4.create(), position);

  return modelMatrix;
}

export function projectCoordinate(x, y, fromProj = 'EPSG:3008') {
  return proj4(fromProj, 'EPSG:3857', [x, y]);
}

export function projectVertices(vertices) {
  const projectedVertices = [];
  for (const vertex of vertices) {
    const projectedCoordinate = projectCoordinate(vertex[0], vertex[1]);
    projectedVertices.push([
      projectedCoordinate[0],
      projectedCoordinate[1],
      vertex[2],
    ]);
  }
  return projectedVertices;
}

export function projectExtent(extent) {
  const projectedExtentMin = projectCoordinate(extent[0], extent[1]);
  const projectedExtentMax = projectCoordinate(extent[3], extent[4]);
  return [...projectedExtentMin, extent[2], ...projectedExtentMax, extent[5]];
}
