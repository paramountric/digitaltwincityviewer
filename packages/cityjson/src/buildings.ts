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

function calculateNormal(p1, p2, p3) {
  const a = vec3.subtract(vec3.create(), p3, p1);
  const b = vec3.subtract(vec3.create(), p2, p1);
  const cross = vec3.cross(vec3.create(), b, a);
  return vec3.normalize(vec3.create(), cross);
}

function polygonNormal(polygon: Polygon) {
  return calculateNormal(polygon[0], polygon[1], polygon[2]);
}

// wip: just a very quick test to see if colors works
// the colors can be set more granular in boundaries and semantics
function getColor(geometry) {
  const colors = {
    RoofSurface: [1, 0, 0],
    WallSurface: [1, 1, 1],
    GroundSurface: [0.5, 0.5, 0.5],
  };
  const surface = geometry.semantics.surfaces.find(s => s.type);
  return surface ? colors[surface.type] : [0, 0.5, 0];
}

export function buildingsLayerSurfacesLod3Data(cityJson: CityJSONV111) {
  let vertices = [];
  let vertexCount = 0;

  for (const vertex of cityJson.vertices) {
    vertices.push(...vertex);
  }
  const layerProps = {
    data: {
      vertices: [],
      indices: [],
      colors: [],
    },
    modelMatrix: getModelMatrix(cityJson.metadata.geographicalExtent),
  };

  const cityObjects = Object.values(cityJson.CityObjects).filter(
    obj => obj.type === 'Building'
  );
  for (const cityObject of cityObjects) {
    const geometries = (cityObject.geometry as any) || [];
    for (const geometry of geometries) {
      const color = getColor(geometry);
      for (const boundary of geometry.boundaries) {
        const { projected, unprojected } = prepareBoundary(
          boundary,
          cityJson.vertices,
          true, // flatten
          false, // close polygon
          undefined // transform
        );
        const { indices } = triangulate(projected);
        layerProps.data.indices.push(...indices.map(i => i + vertexCount));
        layerProps.data.vertices.push(...unprojected);
        layerProps.data.colors.push(...color, 1, ...color, 1, ...color, 1);
        vertexCount += projected.length / 3;
      }
    }
  }
  return layerProps;
}
