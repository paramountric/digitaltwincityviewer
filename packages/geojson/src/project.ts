import { Feature, Position } from 'geojson';

const EARTH_RADIUS = 6371008.8;
const EARTH_CIRC = 2 * Math.PI * EARTH_RADIUS;
const HALF_EARTH_CIRC = EARTH_CIRC / 2;

// todo: this should be moved to some util place, or why not use proj4
// (epsg4326/epsg3857)
function coordinateToMeters(lng: number, lat: number) {
  const x = lng * (EARTH_CIRC / 360);
  const y = Math.log(Math.tan(lat * (Math.PI / 360) + Math.PI / 4)) / Math.PI;
  return [x, y * HALF_EARTH_CIRC];
}

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

function projectCoordinateInline(lngLat: [number, number]) {
  const meters = coordinateToMeters(lngLat[0], lngLat[1]);
  lngLat[0] = meters[0];
  lngLat[1] = meters[1];
}

export function coordinatesToMeters(features: Feature[]) {
  for (const feature of features) {
    if (feature.geometry.type === 'Point') {
      projectCoordinateInline(feature.geometry.coordinates as [number, number]);
    } else if (feature.geometry.type === 'LineString') {
      forEachCoordinateInLineString(
        feature.geometry.coordinates,
        projectCoordinateInline
      );
    } else if (feature.geometry.type === 'MultiLineString') {
      forEachCoordinateInMultiLineString(
        feature.geometry.coordinates,
        projectCoordinateInline
      );
    } else if (feature.geometry.type === 'Polygon') {
      forEachCoordinateInPolygon(
        feature.geometry.coordinates,
        projectCoordinateInline
      );
    } else if (feature.geometry.type === 'MultiPolygon') {
      forEachCoordinateInMultiPolygon(
        feature.geometry.coordinates,
        projectCoordinateInline
      );
    } else {
      console.warn('fix me!: ', feature);
    }
  }
}
