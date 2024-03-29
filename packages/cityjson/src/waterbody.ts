import { CityJSONV111 } from './CityJSONV111.js';
import { prepareBoundary, triangulate } from './boundary.js';
import { getLayerPosition, LayerMatrixOptions } from './layer.js';

function getColor(cityObject) {
  const label = `${cityObject.class}${cityObject.function || ''}`;
  const colors = {};
  if (!colors[label]) {
    console.log('not found', label);
  }
  return colors[label] || [0.5, 0.5, 0.9, 0.5];
}

export function waterBodySurfaceLod1Data(
  cityJson: CityJSONV111,
  options: LayerMatrixOptions
) {
  const vertices = [];
  let vertexCount = 0;

  for (const vertex of cityJson.vertices) {
    vertices.push(...vertex);
  }

  const { modelMatrix, center, min, max, width, height } = getLayerPosition(
    cityJson.metadata.geographicalExtent,
    options
  );

  const layerProps = {
    data: {
      vertices: [],
      indices: [],
      colors: [],
      objects: [],
    },
    modelMatrix,
    center,
    min,
    max,
    width,
    height,
  };

  const cityObjects = Object.values(cityJson.CityObjects).filter(
    obj => obj.type === 'WaterBody'
  );
  for (const cityObject of cityObjects) {
    const color = getColor(cityObject);
    layerProps.data.objects.push({
      id: cityObject.id,
      type: cityObject.type,
      properties: {
        id: cityObject.id,
        type: cityObject.type,
        class: cityObject.class,
        function: cityObject.function,
        context: cityObject.namespace,
        version: cityObject.version,
      },
    });
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
          layerProps.data.colors.push(...color);
        }
        vertexCount += numVertices;
      }
    }
  }
  return layerProps;
}
