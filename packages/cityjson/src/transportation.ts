import { CityJSONV111 } from './CityJSONV111';
import { prepareBoundary, triangulate } from './boundary';
import { getModelMatrix } from './layer';

function getColor(cityObject) {
  const colors = {
    TrafficArea: [1, 1, 1],
  };
  return colors[cityObject.type] || [1, 1, 1];
}

export function transportationLayerSurfacesLod2Data(cityJson: CityJSONV111) {
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
    obj => obj.type === 'TrafficArea'
  );
  for (const cityObject of cityObjects) {
    const color = getColor(cityObject);
    const geometries = (cityObject.geometry as any) || [];
    for (const geometry of geometries) {
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
          layerProps.data.colors.push(...color, 1, ...color, 1, ...color, 1);
        }
        vertexCount += numVertices;
      }
    }
  }
  return layerProps;
}
