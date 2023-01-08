import fs from 'fs';
import vtpbf from 'vt-pbf';
import geojsonvt from 'geojson-vt';
import bbox from '@turf/bbox';
import { pointToTile } from '@mapbox/tilebelt';
import { FeatureCollection } from 'geojson';

type FeatureDataInput = {
  [key: string]: FeatureCollection;
};

type FeatureDataOptions = {
  maxZoom?: number; // max zoom to preserve detail on; can't be higher than 24
  tolerance?: number; // simplification tolerance (higher means simpler)
  extent?: number; // tile extent (both width and height)
  buffer?: number; // tile buffer on each side
  debug?: 0 | 1 | 2; // logging level (0 to disable, 1 or 2)
  lineMetrics?: boolean; // whether to enable line metrics tracking for LineString/MultiLineString features
  promoteId?: string | null; // name of a feature property to promote to feature.id. Cannot be used with `generateId`
  generateId?: boolean; // whether to generate feature ids. Cannot be used with `promoteId`
  indexMaxZoom?: number; // max zoom in the initial tile index
  indexMaxPoints?: number; // max number of points per tile in the index
};

function isBrowser() {
  return (
    typeof window !== 'undefined' && typeof window.document !== 'undefined'
  );
}

/*
 * data A dictionary where values are geojson FeatureCollection
 * (if data is a geojson FeatureCollection, a single tile index is returned)
 *
 * return A dictionary with tile index for each layer if dictionary was input
 * return A tile index if a geojson was input
 *
 * note: consider refactoring this into two separate functions
 */
export function toTileIndex(
  data: FeatureDataInput | FeatureCollection,
  options: FeatureDataOptions
) {
  const resolvedOptions = Object.assign(
    {
      maxZoom: 18,
      tolerance: 3,
      extent: 4096,
      buffer: 64,
      debug: 0,
      lineMetrics: false,
      promoteId: null,
      generateId: false,
      indexMaxZoom: 5,
      indexMaxPoints: 100000,
    },
    options
  );
  // todo validate this value to geojson schema
  if (data.type && data.type === 'FeatureCollection') {
    return geojsonvt(data, resolvedOptions);
  }
  const tileIndex = Object.keys(data).reduce((memo, key) => {
    // todo validate this value to geojson schema
    memo[key] = geojsonvt(data[key], resolvedOptions);
    return memo;
  }, {});
  return tileIndex;
}

/*
 * data[key] key is the layer id, value is the geojson data
 *
 * The extent should preferably be given since the first feature collection could be inaccurate for calculating the extent
 * (or just refactor to join all feature collection to calculate the extent)
 */
export function saveToFolderStructure(data: FeatureDataInput, options) {
  if (isBrowser()) {
    throw new Error('This function can not be executed in the browser');
  }
  const extentData = data[Object.keys(data)[0]];
  if (!extentData) {
    throw new Error('At least on FeatureCollection is needed');
  }
  const { minZoom = 8, maxZoom = 18 } = options;

  let extent = options.extent;
  if (!extent) {
    extent = bbox(extentData);
  }

  const tileIndex = toTileIndex(data, options);

  const outputDir = './tiles';

  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, 0o777);
  } else {
    throw new Error(
      'The output directory already exists. Remove it before generating new tiles'
    );
  }

  let tileCount = 1;

  for (let z = minZoom; z <= maxZoom; z++) {
    const zDir = `${outputDir}/${z}`;
    fs.mkdirSync(zDir, 0o777);
    // because the webmercator tiles are y down, y values are reversed below
    const minXY = pointToTile(extent[0], extent[3], z);
    const maxXY = pointToTile(extent[2], extent[1], z);
    console.log('generating zoom: ', zDir);
    console.log('extent', extent);
    console.log('min/max', minXY, maxXY);
    for (let x = minXY[0]; x <= maxXY[0]; x++) {
      const xDir = `${zDir}/${x}`;
      fs.mkdirSync(xDir, 0o777);
      for (let y = minXY[1]; y <= maxXY[1]; y++) {
        const tileData = Object.keys(tileIndex).reduce((memo, key) => {
          const tileLayer = tileIndex[key];
          const tile = tileLayer.getTile(z, x, y);
          if (tile) {
            memo[key] = tile;
          }
          return memo;
        }, {});
        const fileContent = Object.keys(tileData).length
          ? vtpbf.fromGeojsonVt(tileData)
          : '';
        fs.writeFileSync(`${xDir}/${y}.mvt`, fileContent);
        console.log('writing tile number: ', tileCount);
        tileCount++;
      }
    }
  }
}
