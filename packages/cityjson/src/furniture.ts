import { CityJSONV111 } from './CityJSONV111.js';
import { boundaryToPolygon } from './boundary.js';
import { getLayerPosition, LayerMatrixOptions } from './layer.js';

function getColor(cityObject) {
  const colors = {
    Mur: [255, 255, 255],
    ['Stödmur']: [0.1, 0.7, 0.1],
    Fordonsramp: [0.1, 0.7, 0.1],
    Staket: [0.1, 0.7, 0.1],
  };
  return colors[cityObject.function] || [200, 200, 200];
}

export function furnitureLod1Data(
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
    obj => obj.type === 'CityFurniture'
  );
  for (const cityObject of cityObjects) {
    const color = getColor(cityObject);
    const geometries = (cityObject.geometry as any) || [];
    for (const geometry of geometries) {
      if (
        geometry.type !== 'Polygon' &&
        geometry.type !== 'LineString' &&
        geometry.type !== 'Point'
      ) {
        console.warn(
          'geometry type is not supported in city furniture lod 1: ',
          geometry.type
        );
      }
      if (geometry.type === 'LineString') {
        // not sure here: should it be LineString or MultiLineString
        // todo: use a function in boundary to create a polygon from the line
        const lineString = geometry.boundaries[0][0].map(index => {
          return cityJson.vertices[index];
        });
        // console.log(lineString);
        layerProps.data.push({
          type: 'Feature',
          geometry: {
            type: 'LineString',
            coordinates: lineString,
          },
          properties: {
            id: cityObject.id,
            type: cityObject.type,
            context: cityObject.namespace,
            version: cityObject.version,
            color,
            function: cityObject.function,
            lod: geometry.lod,
          },
        });
      } else if (geometry.type === 'Polygon') {
        const polygon = [];
        boundaryToPolygon(geometry.boundaries, cityJson.vertices, polygon);
        layerProps.data.push({
          type: 'Feature',
          geometry: {
            type: 'Polygon',
            coordinates: polygon[0],
          },
          properties: {
            id: cityObject.id,
            type: cityObject.type,
            context: cityObject.namespace,
            version: cityObject.version,
            color,
            function: cityObject.function,
            lod: geometry.lod,
          },
        });
      } else if (geometry.type === 'Point') {
        const point = geometry.boundaries[0][0].map(index => {
          return cityJson.vertices[index];
        });
        layerProps.data.push({
          type: 'Feature',
          geometry: {
            type: 'Point',
            coordinates: point[0],
          },
          properties: {
            id: cityObject.id,
            type: cityObject.type,
            context: cityObject.namespace,
            version: cityObject.version,
            color,
            function: cityObject.function,
            lod: geometry.lod,
          },
        });
      }
    }
  }
  return layerProps;
}
