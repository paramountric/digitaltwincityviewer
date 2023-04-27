import { saveToFolderStructure } from '../index.js';
import {
  // prepareDataBuildings2018,
  // prepareDataBuildings2050,
  prepareWater,
  prepareRoads,
  prepareAggregatorData,
  prepareCircularityData,
} from './prepare-data.js';

// this file is an example on tile generation for the circularity project

export async function generateTiles() {
  const buildings = prepareCircularityData();
  for (const feature of buildings.features) {
    console.log(feature.properties);
  }
}

// export async function generateTiles() {
//   const buildings2018 = prepareDataBuildings2018();
//   const buildings2050 = prepareDataBuildings2050();
//   console.log('prepare data for aggregators - grid1km');
//   const grid1Km2018 = prepareAggregatorData(buildings2018, 'grid1km');
//   const grid1Km2050 = prepareAggregatorData(buildings2050, 'grid1km');
//   console.log('prepare data for aggregators - grid250m');
//   const grid250m2018 = prepareAggregatorData(buildings2018, 'grid250m');
//   const grid250m2050 = prepareAggregatorData(buildings2050, 'grid250m');
//   console.log('prepare data for aggregators - grid100m');
//   const grid100m2018 = prepareAggregatorData(buildings2018, 'grid100m');
//   const grid100m2050 = prepareAggregatorData(buildings2050, 'grid100m');
//   console.log('prepare data for aggregators - grid50m');
//   // const cityDistricts2018 = prepareAggregatorData(
//   //   buildings2018,
//   //   'cityDistricts'
//   // );
//   // const cityDistricts2050 = prepareAggregatorData(
//   //   buildings2050,
//   //   'cityDistricts'
//   // );
//   // console.log('prepare data for aggregators - baseAreas');
//   // const baseAreas2018 = prepareAggregatorData(buildings2018, 'baseAreas');
//   // const baseAreas2050 = prepareAggregatorData(buildings2050, 'baseAreas');
//   // console.log('prepare data for aggregators - primaryAreas');
//   // const primaryAreas2018 = prepareAggregatorData(buildings2018, 'primaryAreas');
//   // const primaryAreas2050 = prepareAggregatorData(buildings2050, 'primaryAreas');
//   //const featureTable = {};
//   console.log('shorten property names, and prepare context data');
//   const data = {
//     buildings2018,
//     buildings2050,
//     grid1Km2018,
//     grid1Km2050,
//     grid250m2018,
//     grid250m2050,
//     grid100m2018,
//     grid100m2050,
//     // cityDistricts2018,
//     // cityDistricts2050,
//     // baseAreas2018,
//     // baseAreas2050,
//     // primaryAreas2018,
//     // primaryAreas2050,
//     water: prepareWater(),
//     roads: prepareRoads(),
//   };

//   console.log('generate tiles');
//   saveToFolderStructure(data, {
//     minZoom: 8,
//     maxZoom: 16,
//   });
// }

// for running in terminal
generateTiles();
