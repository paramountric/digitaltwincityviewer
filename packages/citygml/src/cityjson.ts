import { vec3, mat4 } from 'gl-matrix';
import earcut from 'earcut';
import { CityJSONV111 } from './CityJSONV111';

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

function triangulate(mp: MultiPolygon) {
  const { vertices, holes, dimensions } = earcut.flatten(mp);
  const indices = earcut(vertices, holes, dimensions);
  return {
    vertices,
    indices,
    holes,
  };
}

function getModelMatrix(extent) {
  const min = [extent[0], extent[1], extent[2]] as vec3;
  const max = [extent[3], extent[4], extent[4]] as vec3;

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

function cityJsonMesh(cityJson: CityJSONV111) {
  let vertices = [];
  for (const vertex of cityJson.vertices) {
    vertices = vertices.concat(vertex);
  }
  const mesh = {
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
        for (const polygon of boundary) {
          mesh.data.indices = mesh.data.indices.concat(polygon);
        }
      }
    }
  }
  return mesh;
}
export { cityJsonMesh };
