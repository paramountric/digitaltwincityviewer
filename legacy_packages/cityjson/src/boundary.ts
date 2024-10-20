import { vec3, mat4, quat } from 'gl-matrix';
import { earcut } from '@math.gl/polygon';

// These are index based structure according to spec
// https://www.cityjson.org/dev/geom-arrays/
type VertexIndex = number;
type MultiPoint = VertexIndex[];
type MultiLineString = MultiPoint[];
type Surface = MultiPoint[]; // just for semantics, same structure as MultiLineString
type MultiSurface = Surface[]; // the first polygon in the surface is exerior, the subsequent are holes
type CompositeSurface = MultiSurface; // same structure but all surfaces are exterior and must be continuously connected (not overlapping or disconnected)
type Solid = CompositeSurface[];
type MultiSolid = Solid[]; // group of solids
type CompositeSolid = MultiSolid; // adjacent solids

// These are typical geometries with vertices, consider move to a geometry module
// The GeoJSON geometries are materialised into these during parsing and processing
type Point = [number, number, number];
type Polygon = Point[];
type MultiPolygon = Polygon[];

export {
  MultiPoint,
  MultiLineString,
  Surface,
  MultiSurface,
  CompositeSurface,
  Solid,
  MultiSolid,
  CompositeSolid,
  Point,
  Polygon,
  MultiPolygon,
};

// wip: buffer zone
export function lineStringToPolygon(boundary, vertices, out) {
  if (!Array.isArray(boundary[0])) {
    const lineString = [];
    for (let i = 0; i < boundary.length; i++) {
      const vertex = vertices[boundary[i]];
      lineString.push(vertex);
    }
    // todo: create buffer zone around line and return as polygon
  } else {
    out.push([]);
    for (let i = 0; i < boundary.length; i++) {
      lineStringToPolygon(boundary[i], vertices, out);
    }
  }
  return out;
}

export function boundaryToPolygon(boundary, vertices, out) {
  if (!Array.isArray(boundary[0])) {
    if (boundary.length < 3) {
      return out;
    }

    for (let i = 0; i < boundary.length; i++) {
      const vertex = vertices[boundary[i]];
      out.push(vertex);
    }
    if (boundary[0] !== boundary[boundary.length - 1]) {
      const firstPoint = vertices[boundary[0]];
      out.push(firstPoint);
    }
  } else {
    out.push([]);
    for (let i = 0; i < boundary.length; i++) {
      boundaryToPolygon(boundary[i], vertices, out[out.length - 1]);
    }
  }
  return out;
}

// note: the projection in this case means to project vertical surfaces to the ground
export function prepareBoundary(
  boundary,
  vertices,
  flatten = false,
  closePolygon = false,
  transform: undefined | mat4,
  out = {
    projected: [],
    unprojected: [],
  }
) {
  if (!Array.isArray(boundary[0])) {
    if (boundary.length < 3) {
      return out;
    }
    if (!transform) {
      const n = calculateNormal(
        vertices[boundary[0]],
        vertices[boundary[1]],
        vertices[boundary[2]]
      );
      const q = quat.rotationTo([0, 0, 0], n, [0, 0, 1]);
      transform = mat4.fromQuat(mat4.create(), q);
    }
    for (let i = 0; i < boundary.length; i++) {
      const unprojected = vertices[boundary[i]];
      const projected = vec3.transformMat4([0, 0, 0], unprojected, transform);
      if (flatten) {
        out.projected.push(...projected);
        out.unprojected.push(...unprojected);
      } else {
        out.projected.push(projected);
        out.unprojected.push(unprojected);
      }
    }
    if (closePolygon && boundary[0] !== boundary[boundary.length - 1]) {
      const firstPoint = vertices[boundary[0]];
      out.projected.push(
        ...vec3.transformMat4([0, 0, 0], firstPoint, transform)
      );
      out.unprojected.push(...firstPoint);
    }
  } else {
    if (!flatten) {
      out.projected.push([]);
    }
    for (let i = 0; i < boundary.length; i++) {
      prepareBoundary(
        boundary[i],
        vertices,
        flatten,
        closePolygon,
        transform,
        flatten ? out : out[out.projected.length - 1]
      );
    }
  }
  return out;
}

export function triangulate(flattened: number[]) {
  const indices = earcut(flattened, undefined, 3);

  return {
    indices,
  };
}

function calculateNormal(p1, p2, p3) {
  const a = vec3.subtract(vec3.create(), p3, p1);
  const b = vec3.subtract(vec3.create(), p2, p1);
  const cross = vec3.cross(vec3.create(), b, a);
  return vec3.normalize(vec3.create(), cross);
}
