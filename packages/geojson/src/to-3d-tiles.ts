// ! experimental

import fs from 'fs-extra';
import geojsonvt from 'geojson-vt';
//import { pointToTile } from '@mapbox/tilebelt';
import { FeatureCollection } from 'geojson';
import { getBounds } from './bounds.js';

type GeoJsonDict = {
  [key: string]: FeatureCollection;
};

type ToGltfOptions = {
  minZoom?: number;
  maxZoom?: number;
  lngMin?: number;
  lngMax?: number;
  latMin?: number;
  latMax?: number;
  outDir?: string;
};

type GeoJsonVtOptions = {
  maxZoom: number; // max zoom to preserve detail on
  indexMaxZoom: number; // max zoom in the tile index
  indexMaxPoints: number; // max number of points per tile in the tile index
  tolerance: number; // simplification tolerance (higher means simpler)
  extent: number; // tile extent
  buffer: number; // tile buffer on each side
  lineMetrics: boolean; // whether to calculate line metrics
  promoteId: string | null; // name of a feature property to be promoted to feature.id
  generateId: boolean; // whether to generate feature ids. Cannot be used with promoteId
  debug: 0 | 1 | 2; // logging level (0, 1 or 2)
};

function isBrowser() {
  return (
    typeof window !== 'undefined' && typeof window.document !== 'undefined'
  );
}

/*
 * @param geojsonDict: a dictionary of [layerKey]: geojson
 * @return tileIndexDict: a dictionary of [layerKey]: tileIndex
 */
export function toTileIndex(data: GeoJsonDict, options: GeoJsonVtOptions) {
  const tileIndex = Object.keys(data).reduce((memo, key) => {
    memo[key] = geojsonvt(data[key], options);
    return memo;
  }, {});
  return tileIndex;
}

function createGltf(tileData) {
  if (!Object.keys(tileData).length) {
    return null;
  }
  // todo: check out the quadtree sample and generate something similar
  const gltf = {};

  return gltf;
}

export type ToGltfInput = {
  geoJsonDict: GeoJsonDict;
  toGltfOptions: ToGltfOptions;
};

export async function toGltf(input: ToGltfInput): Promise<void> {
  const { minZoom, maxZoom = 16 } = input.toGltfOptions;
  const geojsonVtOptions: GeoJsonVtOptions = {
    maxZoom,
    indexMaxZoom: maxZoom,
    indexMaxPoints: 10000,
    tolerance: 3,
    extent: 4096,
    buffer: 64,
    lineMetrics: false,
    promoteId: null,
    generateId: false,
    debug: 0,
  };
  const tileIndexes = toTileIndex(input.geoJsonDict, geojsonVtOptions);

  // todo: use schema
  type Gltf = {
    //
  };
  const gltfIndex = new Map<string, Gltf>();

  // notes: index all features and cache them to avoid updating non-changed data
  // do not use gltf for geojson -> instead load tiles with geojson entities and use geojson layer
  // this means that geoson-vt should not be used, at least not projecting to tile extent
  // convert to entities
  // for 3D data -> convert to glft

  for (const tileIndexKey of Object.keys(tileIndexes)) {
    const tileIndex = tileIndexes[tileIndexKey];
    for (const tileKey of Object.keys(tileIndex.tiles)) {
      const features = tileIndex.tiles[tileKey].features;
      console.log(features);
    }
  }

  // for (let z = minZoom; z <= maxZoom; z++) {
  //   const zDir = `${outputDir}/${z}`;
  //   fs.mkdirSync(zDir, 0o777);
  //   const minXY = pointToTile(extent[0], extent[3], z);
  //   const maxXY = pointToTile(extent[2], extent[1], z);
  //   console.log('generating zoom: ', zDir);
  //   for (let x = minXY[0]; x <= maxXY[0]; x++) {
  //     const xDir = `${zDir}/${x}`;
  //     fs.mkdirSync(xDir, 0o777);
  //     console.log(minXY, maxXY);
  //     for (let y = minXY[1]; y <= maxXY[1]; y++) {
  //       console.log(process.memoryUsage());
  //       const tileData = Object.keys(tileIndex).reduce((memo, key) => {
  //         const tileLayer = tileIndex[key];
  //         const tile = tileLayer.getTile(z, x, y);
  //         if (tile) {
  //           memo[key] = tile;
  //         }
  //         return memo;
  //       }, {});
  //       const fileContent = createGltf(tileData);
  //       if (fileContent) {
  //         fs.writeFileSync(`${xDir}/${y}.gltf`, fileContent);
  //         console.log('writing tile number: ', tileCount);
  //       } else {
  //         console.log('skipping tile ', tileCount);
  //       }

  //       tileCount++;
  //     }
  //   }
  // }
}

/*
 * data[key] key is the layer id, value is the geojson data
 */
// export function saveToFolderStructure(data) {
//   if (isBrowser()) {
//     throw new Error('This function can not be executed in the browser');
//   }
//   // TODO: figure out how to deal with the extent. To calculate it from all datasets or give as input
//   // for now the 1 km grid is easiest to use and thus required in the input data
//   if (!data.grid1km) {
//     return console.log(
//       'The function needs a geojson dataset with the key grid1km to calculate the extent'
//     );
//   }
//   const minZoom = 8;
//   const maxZoom = 16;
//   const options = {
//     maxZoom,
//     indexMaxZoom: maxZoom,
//     indexMaxPoints: 0,
//   };
//   const tileIndex = toTileIndex(data, options);
//   console.log(process.memoryUsage());
//   const extent = bbox(data.grid1km);

//   console.log(extent);

//   const outputDir = './tiles';
//   if (!fs.existsSync(outputDir)) {
//     fs.mkdirSync(outputDir, 0o777);
//   } else {
//     throw new Error(
//       'The output directory already exists. Remove it before generating new tiles'
//     );
//   }

//   let tileCount = 1;

//   for (let z = minZoom; z <= maxZoom; z++) {
//     const zDir = `${outputDir}/${z}`;
//     fs.mkdirSync(zDir, 0o777);
//     const minXY = pointToTile(extent[0], extent[3], z);
//     const maxXY = pointToTile(extent[2], extent[1], z);
//     console.log('generating zoom: ', zDir);
//     for (let x = minXY[0]; x <= maxXY[0]; x++) {
//       const xDir = `${zDir}/${x}`;
//       fs.mkdirSync(xDir, 0o777);
//       console.log(minXY, maxXY);
//       for (let y = minXY[1]; y <= maxXY[1]; y++) {
//         console.log(process.memoryUsage());
//         const tileData = Object.keys(tileIndex).reduce((memo, key) => {
//           const tileLayer = tileIndex[key];
//           const tile = tileLayer.getTile(z, x, y);
//           if (tile) {
//             memo[key] = tile;
//           }
//           return memo;
//         }, {});
//         const fileContent = createGltf(tileData);
//         if (fileContent) {
//           fs.writeFileSync(`${xDir}/${y}.gltf`, fileContent);
//           console.log('writing tile number: ', tileCount);
//         } else {
//           console.log('skipping tile ', tileCount);
//         }

//         tileCount++;
//       }
//     }
//   }
// }
