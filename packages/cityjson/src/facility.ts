import { CityJSONV111 } from './CityJSONV111.js';
import { prepareBoundary, triangulate, boundaryToPolygon } from './boundary.js';
import { getLayerPosition, LayerMatrixOptions } from './layer.js';

function getColor(cityObject) {
  const colors = {
    Dagvattenbrunn: [255, 215, 0],
  };
  if (!colors[cityObject.function]) {
    console.log('add color: ', cityObject.function);
  }
  return colors[cityObject.function] || [0, 0, 0];
}

export function facilityLod1Data(
  cityJson: CityJSONV111,
  options: LayerMatrixOptions
) {
  const { modelMatrix, center, min, max, width, height } = getLayerPosition(
    cityJson.metadata.geographicalExtent,
    options
  );

  const layerProps = {
    data: [], // use geojson features for lod1 (except that webmercator projection is used)
    modelMatrix,
    center,
    min,
    max,
    width,
    height,
  };

  const cityObjects = Object.values(cityJson.CityObjects).filter(
    obj => obj.type === 'Facility'
  );
  for (const cityObject of cityObjects) {
    const color = getColor(cityObject);
    const geometries = (cityObject.geometry as any) || [];
    for (const geometry of geometries) {
      if (geometry.type !== 'Point') {
        console.warn(
          'geometry type is not supported in facility lod 1: ',
          geometry.type
        );
      }
      const point = cityJson.vertices[geometry.boundaries[0][0][0]];
      layerProps.data.push({
        type: 'Feature',
        geometry: {
          type: 'Point',
          coordinates: point,
        },
        properties: {
          id: cityObject.id,
          context: cityObject.namespace,
          version: cityObject.version,
          function: cityObject.function,
          type: cityObject.type,
          lod: geometry.lod,
          color,
        },
      });
    }
  }
  return layerProps;
}
