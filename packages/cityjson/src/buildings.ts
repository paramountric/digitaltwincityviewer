import { CityJSONV111 } from './CityJSONV111';
import { prepareBoundary, triangulate } from './boundary';
import { getModelMatrix } from './layer';

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
  const vertices = [];
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
        const numVertices = projected.length / 3;
        for (let i = 0; i < numVertices; i++) {
          layerProps.data.colors.push(...color, 1);
        }
        vertexCount += numVertices;
      }
    }
  }
  return layerProps;
}
