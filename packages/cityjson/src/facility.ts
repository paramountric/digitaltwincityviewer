import { CityJSONV111 } from './CityJSONV111';
import { prepareBoundary, triangulate, boundaryToPolygon } from './boundary';
import { getLayerPosition, LayerMatrixOptions } from './layer';

function getColor(cityObject) {
  const colors = {
    Mur: [255, 255, 255],
    ['Stödmur']: [0.1, 0.7, 0.1],
    Fordonsramp: [0.1, 0.7, 0.1],
    Staket: [0.1, 0.7, 0.1],
  };
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
          color,
          function: cityObject.function,
        },
      });
    }
  }
  console.log(layerProps);
  return layerProps;
}
