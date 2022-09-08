import { Feature, Position } from 'geojson';
import proj4 from 'proj4';

export function toWebmercator(lng, lat) {
  return proj4('EPSG:4326', 'EPSG:3857', [lng, lat]);
}

// const EARTH_RADIUS = 6371008.8;
// const EARTH_CIRC = 2 * Math.PI * EARTH_RADIUS;
// const HALF_EARTH_CIRC = EARTH_CIRC / 2;

// // todo: this should be moved to some util place, or why not use proj4
// // (epsg4326/epsg3857)
// function coordinateToMeters(lng: number, lat: number) {
//   const x = lng * (EARTH_CIRC / 360);
//   const y = Math.log(Math.tan(lat * (Math.PI / 360) + Math.PI / 4)) / Math.PI;
//   return [x, y * HALF_EARTH_CIRC];
// }

function forEachCoordinateInLineString(
  lineString: Position[],
  fn,
  meterOffsetX = 0,
  meterOffsetY = 0
) {
  for (const point of lineString) {
    fn(point, meterOffsetX, meterOffsetY);
  }
}

function forEachCoordinateInMultiLineString(
  multiLineString: Position[][],
  fn,
  meterOffsetX = 0,
  meterOffsetY = 0
) {
  for (const lineString of multiLineString) {
    forEachCoordinateInLineString(lineString, fn, meterOffsetX, meterOffsetY);
  }
}

function forEachCoordinateInPolygon(
  polygon: Position[][],
  fn,
  meterOffsetX = 0,
  meterOffsetY = 0
) {
  const multiPolygon =
    Array.isArray(polygon[0]) && Number.isFinite(polygon[0][0])
      ? [polygon]
      : polygon;
  for (const poly of multiPolygon) {
    for (const point of poly) {
      fn(point, meterOffsetX, meterOffsetY);
    }
  }
}

function forEachCoordinateInMultiPolygon(
  multiPolygon: Position[][][],
  fn,
  meterOffsetX = 0,
  meterOffsetY = 0
) {
  for (const polygon of multiPolygon) {
    forEachCoordinateInPolygon(polygon, fn, meterOffsetX, meterOffsetY);
  }
}

function projectCoordinateInline(
  lngLat: [number, number],
  meterOffsetX = 0,
  meterOffsetY = 0
) {
  const meters = toWebmercator(lngLat[0], lngLat[1]);
  lngLat[0] = meters[0] + meterOffsetX;
  lngLat[1] = meters[1] + meterOffsetY;
}

export function coordinatesToMeterOffsets(
  features: Feature[],
  c1: number,
  c2: number,
  isLngLat = true
) {
  const offsetCoord = isLngLat ? toWebmercator(c1, c2) : [c1, c2];
  return coordinatesToMeters(features, offsetCoord[0], offsetCoord[1]);
}

// NOTE: this changes feature geometry by reference, be careful
// ! only if the geojson is in EPSG:4326, if other crs needed use convert package (this was already working code so it's kept here for now)
export function coordinatesToMeters(
  features: Feature[],
  meterOffsetX = 0,
  meterOffsetY = 0
) {
  for (const feature of features) {
    if (feature.geometry.type === 'Point') {
      projectCoordinateInline(
        feature.geometry.coordinates as [number, number],
        meterOffsetX,
        meterOffsetY
      );
    } else if (feature.geometry.type === 'LineString') {
      forEachCoordinateInLineString(
        feature.geometry.coordinates,
        projectCoordinateInline,
        meterOffsetX,
        meterOffsetY
      );
    } else if (feature.geometry.type === 'MultiLineString') {
      forEachCoordinateInMultiLineString(
        feature.geometry.coordinates,
        projectCoordinateInline,
        meterOffsetX,
        meterOffsetY
      );
    } else if (feature.geometry.type === 'Polygon') {
      forEachCoordinateInPolygon(
        feature.geometry.coordinates,
        projectCoordinateInline,
        meterOffsetX,
        meterOffsetY
      );
    } else if (feature.geometry.type === 'MultiPolygon') {
      forEachCoordinateInMultiPolygon(
        feature.geometry.coordinates,
        projectCoordinateInline,
        meterOffsetX,
        meterOffsetY
      );
    } else {
      console.warn('fix me!: ', feature);
    }
  }
}
