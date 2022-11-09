import { FeatureCollection, Position } from 'geojson';
import { convert as convertCoordinate } from '@dtcv/convert';

function forEachCoordinateInLineString(lineString: Position[], fn) {
  for (const point of lineString) {
    fn(point);
  }
}

function forEachCoordinateInMultiLineString(multiLineString: Position[][], fn) {
  for (const lineString of multiLineString) {
    forEachCoordinateInLineString(lineString, fn);
  }
}

function forEachCoordinateInPolygon(polygon: Position[][], fn) {
  const multiPolygon =
    Array.isArray(polygon[0]) && Number.isFinite(polygon[0][0])
      ? [polygon]
      : polygon;
  for (const poly of multiPolygon) {
    for (const point of poly) {
      fn(point);
    }
  }
}

function forEachCoordinateInMultiPolygon(multiPolygon: Position[][][], fn) {
  for (const polygon of multiPolygon) {
    forEachCoordinateInPolygon(polygon, fn);
  }
}

const convert = (
  jsonData: FeatureCollection,
  crs: string, // from crs -> to webmercator
  cityXY?: number[],
  setZToZero = false
) => {
  // curry it
  const convertWrapper = function (point: [number, number]) {
    const [x, y] = point;
    return convertCoordinate(x, y, crs, cityXY, point, setZToZero);
  };
  const { features } = jsonData;
  for (const feature of features) {
    if (feature.geometry.type === 'Point') {
      convertWrapper(feature.geometry.coordinates as [number, number]);
    } else if (feature.geometry.type === 'LineString') {
      forEachCoordinateInLineString(
        feature.geometry.coordinates,
        convertWrapper
      );
    } else if (feature.geometry.type === 'MultiLineString') {
      forEachCoordinateInMultiLineString(
        feature.geometry.coordinates,
        convertWrapper
      );
    } else if (feature.geometry.type === 'Polygon') {
      forEachCoordinateInPolygon(feature.geometry.coordinates, convertWrapper);
    } else if (feature.geometry.type === 'MultiPolygon') {
      forEachCoordinateInMultiPolygon(
        feature.geometry.coordinates,
        convertWrapper
      );
    } else {
      console.warn('fix me!: ', feature);
    }
  }
  return jsonData;
};

export { convert };
