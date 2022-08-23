import fs from 'fs';
import geojsonvt from 'geojson-vt';
import bbox from '@turf/bbox';
import { pointToTile } from '@mapbox/tilebelt';


function isBrowser() {
  return (typeof window !== 'undefined') && (typeof window.document !== 'undefined');
}

/*
* data A dictionary where values are geojson FeatureCollection
* (if data is a geojson FeatureCollection, a single tile index is returned)
*
* return A dictionary with tile index for each layer if dictionary was input
* return A tile index if a geojson was input
*/
export function toTileIndex(data, options) {
  // todo validate this value to geojson schema
  if (data.type && data.type === 'FeatureCollection') {
    return geojsonvt(data, options);
  }
  const tileIndex = Object.keys(data).reduce((memo, key) => {
    // todo validate this value to geojson schema
    memo[key] = geojsonvt(data[key], options);
    return memo;
  }, {});
  return tileIndex;
}

function createGlTf(tileData) {
  // todo: check out the quadtree sample and generate something similar

  // if tileData does not have any features, no file should be generated
  Object.keys(tileData).length ? function (tileData) : '';
}

/*
* data[key] key is the layer id, value is the geojson data
*/
export function saveToFolderStructure(data) {
  if (isBrowser()) {
    throw new Error('This function can not be executed in the browser');
  }
  // TODO: figure out how to deal with the extent. To calculate it from all datasets or give as input
  // for now the 1 km grid is easiest to use and thus required in the input data
  if (!data.grid1km) {
    return console.log('The function needs a geojson dataset with the key grid1km to calculate the extent');
  }
  const minZoom = 8;
  const maxZoom = 16;
  const options = {
    maxZoom,
    indexMaxZoom: maxZoom,
    indexMaxPoints: 0
  };
  const tileIndex = toTileIndex(data, options);
  console.log(process.memoryUsage());
  const extent = bbox(data.grid1km);

  console.log(extent);

  const outputDir = './tiles';
  if (!fs.existsSync(outputDir)){
    fs.mkdirSync(outputDir, 0o777);
  } else {
    throw new Error('The output directory already exists. Remove it before generating new tiles');
  }

  let tileCount = 1;

  for (let z = minZoom; z <= maxZoom; z++) {
    const zDir = `${outputDir}/${z}`;
    fs.mkdirSync(zDir, 0o777);
    const minXY = pointToTile(extent[0], extent[3], z);
    const maxXY = pointToTile(extent[2], extent[1], z);
    console.log('generating zoom: ', zDir);
    for (let x = minXY[0]; x <= maxXY[0]; x++) {
      const xDir = `${zDir}/${x}`;
      fs.mkdirSync(xDir, 0o777);
      console.log(minXY, maxXY);
      for (let y = minXY[1]; y <= maxXY[1]; y++) {
        console.log(process.memoryUsage());
        const tileData = Object.keys(tileIndex).reduce((memo, key) => {
          const tileLayer = tileIndex[key];
          const tile = tileLayer.getTile(z, x, y);
          if (tile) {
            memo[key] = tile;
          }
          return memo;
        }, {});
        const fileContent = createGlTf(tileData);
        fs.writeFileSync(`${xDir}/${y}.mvt`, fileContent);
        console.log('writing tile number: ', tileCount)
        tileCount++;
      }
    }
  }
}