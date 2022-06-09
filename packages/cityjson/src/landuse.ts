import { CityJSONV111 } from './CityJSONV111';
import { prepareBoundary, triangulate } from './boundary';
import { getLayerPosition, LayerMatrixOptions } from './layer';

function getColor(cityObject) {
  const label = `${cityObject.class}${cityObject.function || ''}`;
  const colors = {
    // note: alpha channel is not activated in shader it appears, use the opacity setting in layer props
    // todo: refactor this to be a separate config and dont use vertex colors if not needed
    'Vegetationstäckt mark': [0.5, 0.9, 0.5, 0.1],
    'Vegetationstäckt markBuskmark': [0.1, 0.7, 0.1, 0.1],
    'Vegetationstäckt markGräsmark': [0.1, 0.9, 0.1, 0.1],
    'Vegetationstäckt markGårdsmark/park': [0.1, 0.9, 0.1, 0.1],
    'Anlagd och bebyggd mark': [0.8, 0.8, 0.5, 0.2],
    'Anlagd och bebyggd markAnlagd mark': [0.8, 0.8, 0.5, 0.2],
    'Anlagd och bebyggd markBebyggd mark': [0.8, 0.8, 0.5, 0.2],
  };
  if (!colors[label]) {
    console.log('not found', label);
  }
  return colors[label] || [1, 1, 1, 1];
}

export function landuseSurfaceLod1Data(
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
    },
    modelMatrix,
    center,
    min,
    max,
    width,
    height,
  };

  const cityObjects = Object.values(cityJson.CityObjects).filter(
    obj => obj.type === 'LandUse'
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
          layerProps.data.colors.push(...color);
        }
        vertexCount += numVertices;
      }
    }
  }
  return layerProps;
}
