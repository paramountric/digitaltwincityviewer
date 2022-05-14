import { vec3, mat4, quat } from 'gl-matrix';
import { earcut } from '@math.gl/polygon';
import { CityJSONV111 } from './CityJSONV111';

// todo: move types to a better place later
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

type Point = [number, number, number];
type Polygon = Point[];
type MultiPolygon = Polygon[];

function getModelMatrix(extent) {
  const min = [extent[0], extent[1], extent[2]] as vec3;
  const max = [extent[3], extent[4], extent[5]] as vec3;

  const size = vec3.sub(vec3.create(), max as vec3, min as vec3);
  const offset = vec3.add(
    vec3.create(),
    min as vec3,
    vec3.scale(vec3.create(), size, 0.5)
  );
  const position = vec3.negate(vec3.create(), offset);

  const modelMatrix = mat4.fromTranslation(mat4.create(), position);

  return modelMatrix;
}

function prepareBoundary(
  boundary,
  vertices,
  out = [],
  flatten = false,
  closePolygon = false
) {
  if (!Array.isArray(boundary[0])) {
    for (let i = 0; i < boundary.length; i++) {
      if (flatten) {
        out.push(...vertices[boundary[i]]);
      } else {
        out.push(vertices[boundary[i]]);
      }
    }
    if (closePolygon && boundary[0] !== boundary[boundary.length - 1]) {
      out.push(...vertices[boundary[0]]);
    }
  } else {
    if (!flatten) {
      out.push([]);
    }
    for (let i = 0; i < boundary.length; i++) {
      prepareBoundary(
        boundary[i],
        vertices,
        flatten ? out : out[out.length - 1],
        flatten,
        closePolygon
      );
    }
  }
  return out;
}

function triangulate(flattened: number[]) {
  const indices = earcut(flattened, undefined, 3);

  return {
    indices,
  };
}

export function multiPolygonDirection(multiPoly, direction) {
  const n = polygonNormal(multiPoly);
  const q = quat.rotationTo([0, 0, 0], n, direction);
  const m = mat4.fromQuat(mat4.create(), q);
  const result = [];
  for (let i = 0; i < multiPoly.length; i++) {
    const inner = [];
    for (let j = 0; j < multiPoly[i].length; j++) {
      inner.push(vec3.transformMat4([0, 0, 0], multiPoly[i][j], m));
    }
    result.push(inner);
  }
  return result;
}

function normal(p1, p2, p3) {
  const a = vec3.subtract(vec3.create(), p3, p1);
  const b = vec3.subtract(vec3.create(), p2, p1);
  const cross = vec3.cross(vec3.create(), b, a);
  return vec3.normalize(vec3.create(), cross);
}

// fix: check polygon type
export function polygonNormal(multiPoly: MultiPolygon) {
  return normal(multiPoly[0][0], multiPoly[0][1], multiPoly[0][2]);
}

export function buildingsLayerSurfacesLod3Data(cityJson: CityJSONV111) {
  let vertices = [];
  let vertexCount = 0;

  for (const vertex of cityJson.vertices) {
    vertices.push(...vertex);
  }
  const layerProps = {
    data: {
      vertices,
      indices: [],
    },
    modelMatrix: getModelMatrix(cityJson.metadata.geographicalExtent),
  };

  const cityObjects = Object.values(cityJson.CityObjects);
  for (const cityObject of cityObjects) {
    const geometries = (cityObject.geometry as any) || [];
    for (const geometry of geometries) {
      for (const boundary of geometry.boundaries) {
        const flattened = [];
        prepareBoundary(boundary, cityJson.vertices, flattened, true, false);
        const { indices } = triangulate(flattened);
        layerProps.data.indices.push(...indices.map(i => i + vertexCount));
        vertexCount += flattened.length / 3;
      }
    }
  }
  return layerProps;
}
