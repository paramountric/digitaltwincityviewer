import { Position } from 'geojson';

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

// WIP: This function is thought to be a generic foreach function for feature collection (also look into the turf one)
// Due to a bug in a project for z level this is now setting all the z values to the given values (basically if 2.5 is required)
const forEachCoordinate = ({ featureCollection, setZ }) => {
  // curry it
  const convertWrapper = function (point: number[]) {
    const [x, y] = point;
    if (setZ || setZ === 0) {
      if (point.length < 3) {
        point.push(setZ);
      } else {
        point[2] = setZ;
      }
    }
    return point;
  };
  const { features } = featureCollection;
  for (const feature of features) {
    if (feature.geometry.type === 'Point') {
      convertWrapper(feature.geometry.coordinates as number[]);
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
  return featureCollection;
};

export { forEachCoordinate };
