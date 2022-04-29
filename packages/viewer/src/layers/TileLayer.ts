import { CompositeLayer } from '@deck.gl/core';
import { TileLayer as TileLayerDeck } from '@deck.gl/geo-layers';
import { SolidPolygonLayer } from '@deck.gl/layers';
import Protobuf from 'pbf';
import { VectorTile } from '@mapbox/vector-tile';

const PI = Math.PI;
const PI_4 = PI / 4;
const TILE_SERVER = 'http://localhost:9000/tiles';
const TILE_SIZE = 512;
const RADIANS_TO_DEGREES = 180 / PI;

/**
 * Unproject world point [x,y] on map onto {lat, lon} on sphere
 *
 * @param {object|Vector} xy - object with {x,y} members
 *  representing point on projected map plane
 * @return {GeoCoordinates} - object with {lat,lon} of point on sphere.
 *   Has toArray method if you need a GeoJSON Array.
 *   Per cartographic tradition, lat and lon are specified as degrees.
 */
export function worldToLngLat([x, y], scale) {
  scale *= TILE_SIZE;
  const lambda2 = (x / scale) * (2 * PI) - PI;
  const phi2 = 2 * (Math.atan(Math.exp(PI - (y / scale) * (2 * PI))) - PI_4);
  return [lambda2 * RADIANS_TO_DEGREES, phi2 * RADIANS_TO_DEGREES];
}

export function decodeTile(x, y, z, arrayBuffer) {
  const tile = new VectorTile(new Protobuf(arrayBuffer));

  const result = [];
  const xProj = x * TILE_SIZE;
  const yProj = y * TILE_SIZE;
  const scale = Math.pow(2, z);

  const projectFunc = project.bind(null, xProj, yProj, scale);

  const layerName = 'cityModel';
  const vectorTileLayer = tile.layers[layerName];
  if (!vectorTileLayer) {
    return [];
  }
  for (let i = 0; i < vectorTileLayer.length; i++) {
    const vectorTileFeature = vectorTileLayer.feature(i);
    const features = vectorTileFeatureToProp(vectorTileFeature, projectFunc);
    features.forEach(f => {
      f.properties.layer = layerName;
      if (f.properties.height) {
        result.push(f);
      }
    });
  }
  return result;
}

export async function getTileData({ x, y, z }) {
  const mapSource = `${TILE_SERVER}/${z}/${x}/${y}`;

  const response = await fetch(mapSource);

  if (response.status === 404) {
    return [];
  }

  const buffer = await response.arrayBuffer();
  return decodeTile(x, y, z, buffer);
}

function project(x, y, scale, line, extent) {
  const sizeToPixel = extent / TILE_SIZE;

  for (let ii = 0; ii < line.length; ii++) {
    const p = line[ii];
    // LNGLAT
    line[ii] = worldToLngLat(
      [x + p[0] / sizeToPixel, y + p[1] / sizeToPixel],
      scale
    );
  }
}

/* adapted from @mapbox/vector-tile/lib/vectortilefeature.js for better perf */
/* eslint-disable */
export function vectorTileFeatureToProp(vectorTileFeature, project) {
  let coords = getCoordinates(vectorTileFeature);
  const extent = vectorTileFeature.extent;
  let i;
  let j;

  coords = classifyRings(coords);
  for (i = 0; i < coords.length; i++) {
    for (j = 0; j < coords[i].length; j++) {
      project(coords[i][j], extent);
    }
  }

  return coords.map(coordinates => ({
    coordinates,
    properties: vectorTileFeature.properties,
  }));
}

function getCoordinates(vectorTileFeature) {
  const pbf = vectorTileFeature._pbf;
  pbf.pos = vectorTileFeature._geometry;

  const end = pbf.readVarint() + pbf.pos;
  let cmd = 1;
  let length = 0;
  let x = 0;
  let y = 0;

  const lines = [];
  let line;

  while (pbf.pos < end) {
    if (length <= 0) {
      const cmdLen = pbf.readVarint();
      cmd = cmdLen & 0x7;
      length = cmdLen >> 3;
    }

    length--;

    if (cmd === 1 || cmd === 2) {
      x += pbf.readSVarint();
      y += pbf.readSVarint();

      if (cmd === 1) {
        // moveTo
        if (line) lines.push(line);
        line = [];
      }

      if (line) line.push([x, y]);
    } else if (cmd === 7) {
      // Workaround for https://github.com/mapbox/mapnik-vector-tile/issues/90
      if (line) {
        line.push(line[0].slice()); // closePolygon
      }
    } else {
      throw new Error(`unknown command ${cmd}`);
    }
  }

  if (line) lines.push(line);

  return lines;
}

// classifies an array of rings into polygons with outer rings and holes

function classifyRings(rings) {
  const len = rings.length;

  if (len <= 1) return [rings];

  const polygons = [];
  let polygon;
  let ccw;

  for (let i = 0; i < len; i++) {
    const area = signedArea(rings[i]);
    if (area === 0) {
      continue;
    }

    if (ccw === undefined) {
      ccw = area < 0;
    }

    if (ccw === area < 0) {
      if (polygon) {
        polygons.push(polygon);
      }
      polygon = [rings[i]];
    } else if (polygon) {
      polygon.push(rings[i]);
    }
  }
  if (polygon) {
    polygons.push(polygon);
  }

  return polygons;
}

function signedArea(ring) {
  let sum = 0;
  for (let i = 0, len = ring.length, j = len - 1, p1, p2; i < len; j = i++) {
    p1 = ring[i];
    p2 = ring[j];
    sum += (p2[0] - p1[0]) * (p1[1] + p2[1]);
  }
  return sum;
}

export default class TileLayer extends CompositeLayer {
  renderSubLayers(props) {
    if (!props.data || !props.data.length) {
      return null;
    }
    console.log('render');
    return new SolidPolygonLayer({
      ...props,
      // parameter: {
      //   blendFunc: [
      //     'SRC_ALPHA',
      //     'ONE_MINUS_SRC_ALPHA',
      //     'ONE',
      //     'ONE_MINUS_SRC_ALPHA',
      //   ],
      //   blendEquation: ['FUNC_ADD', 'FUNC_ADD'],
      // },
      extruded: true,
      opacity: 1,
      filled: true,
      getElevation: feature => feature.properties.height || 10,
      getPolygon: feature => feature.coordinates,
      getFillColor: [150, 150, 150, 200],
    });
  }

  renderLayers() {
    return [
      new TileLayerDeck({
        getTileData: xyz => getTileData(xyz),
        renderSubLayers: this.renderSubLayers.bind(this),
        refinementStrategy: 'never',
        zoomOffset: 0,
        // extent: [minx, miny, maxx, maxy] <- provide this on city level to make sure no other tiles are loaded
        // updateTriggers: {},
      }),
    ];
  }
}
