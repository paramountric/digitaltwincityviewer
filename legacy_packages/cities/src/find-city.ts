import { getMeterZoom, getDistanceScales } from '@math.gl/web-mercator';
// this should probably be moved to separate service later as it bloats the bundle
// at the moment its more for testing that it works
import RBush from 'rbush';
import Queue from 'tinyqueue';

// https://simplemaps.com/data/se-cities
import cityList from './cities.js';
import { City } from './city.js';

// The knn was copied here due to propblems on the tinyqueue dependency
// https://github.com/mourner/rbush-knn/blob/master/index.js
// Copyright (c) 2016, Vladimir Agafonkin ISC License
export default function knn(tree, x, y, n?, predicate?, maxDistance?) {
  let node = tree.data;
  const result = [];
  const toBBox = tree.toBBox;
  let i;
  let child;
  let dist;
  let candidate;

  const queue = new Queue(undefined, compareDist);

  while (node) {
    for (i = 0; i < node.children.length; i++) {
      child = node.children[i];
      dist = boxDist(x, y, node.leaf ? toBBox(child) : child);
      if (!maxDistance || dist <= maxDistance * maxDistance) {
        queue.push({
          node: child,
          isItem: node.leaf,
          dist: dist,
        });
      }
    }

    while (queue.length && queue.peek().isItem) {
      candidate = queue.pop().node;
      if (!predicate || predicate(candidate)) result.push(candidate);
      if (n && result.length === n) return result;
    }

    node = queue.pop();
    if (node) node = node.node;
  }

  return result;
}

function compareDist(a, b) {
  return a.dist - b.dist;
}

function boxDist(x, y, box) {
  const dx = axisDist(x, box.minX, box.maxX),
    dy = axisDist(y, box.minY, box.maxY);
  return dx * dx + dy * dy;
}

function axisDist(k, min, max) {
  return k < min ? min - k : k <= max ? 0 : k - max;
}

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

// todo: just generate a prepared list and require to give the city metadata on loading the viewer from app side
export const cities = cityList.map(c => {
  const lng = Number(c.lng);
  const lat = Number(c.lat);
  const xy = coordinateToMeters(lng, lat);
  const distanceScale = getDistanceScales({ longitude: lng, latitude: lat });
  const startZoom = getMeterZoom({ latitude: lat });
  const cityRadius = 4096;
  return {
    minX: xy[0] - cityRadius,
    minY: xy[1] - cityRadius,
    maxX: xy[0] + cityRadius,
    maxY: xy[1] + cityRadius,
    x: xy[0],
    y: xy[1],
    id: c.id,
    name: c.city,
    lng,
    lat,
    distanceScale,
    startZoom,
  };
});
const tree = new RBush();
tree.load(cities);

// webmercator, or send boolean for lnglat
export function findCity(x: number, y: number, isLngLat?: boolean) {
  let c1 = x;
  let c2 = y;
  if (isLngLat) {
    const meters = coordinateToMeters(c1, c2);
    c1 = meters[0];
    c2 = meters[1];
  }
  const city = knn(tree, c1, c2, 1)[0];
  return {
    name: city.name,
    x: city.minX,
    y: city.minY,
  } as City;
}
