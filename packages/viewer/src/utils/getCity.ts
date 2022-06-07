// this should probably be moved to separate service later as it bloats the bundle
// at the moment its more for testing that it works
import RBush from 'rbush';
import Queue from 'tinyqueue';

// https://simplemaps.com/data/se-cities
import cities from './se.json';

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

const data = cities.map(c => {
  const xy = coordinateToMeters(Number(c.lng), Number(c.lat));
  if (c.city === 'Malmö') {
    console.log(xy);
  }
  // todo: the city should be represented with some "official" bounds and center
  return {
    minX: xy[0],
    minY: xy[1],
    maxX: xy[0] + 1,
    maxY: xy[1] + 1,
    name: c.city,
  };
});
const tree = new RBush();
tree.load(data);

export function getCity(x, y) {
  const city = knn(tree, x, y, 1);
  return city;
}
