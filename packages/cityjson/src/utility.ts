import { CityJSONV111 } from './CityJSONV111.js';
import { prepareBoundary, triangulate, boundaryToPolygon } from './boundary.js';
import { getLayerPosition, LayerMatrixOptions } from './layer.js';

function getColor(cityObject) {
  const colors = {
    '1000': [255, 215, 0],
    '10000': [255, 215, 0],
    Dagvattenbrunn: [255, 215, 0],
  };
  if (!colors[cityObject.function]) {
    console.log('add color: ', cityObject.function);
  }
  return colors[cityObject.function] || [200, 200, 200];
}

export function utilityLod1Data(
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
    obj => obj.type === 'Utility'
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
