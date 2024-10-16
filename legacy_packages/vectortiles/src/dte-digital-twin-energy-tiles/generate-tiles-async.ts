import { saveToFolderStructure } from '../index.js';
import { prepareWater, prepareRoads, prepareTrees } from './prepare-data.js';
import fs from 'fs-extra';
import { resolve } from 'path';
import pkg from 'reproject';
import { addProperty, FeatureCollection, Feature } from '@dtcv/geojson';
import { getColorFromScale } from './colorScales.js';
import { aggregate } from './aggregator.js';
import json from 'big-json';
import booleanPointInPolygon from '@turf/boolean-point-in-polygon';
import clone from '@turf/clone';
import {
  indicatorKeysRefAndClimate,
  indicatorKeysRenovation,
  generalPropertyKeys,
} from './indicator-keys.js';
import bbox from '@turf/bbox';
import RBush from 'rbush';
const { toWgs84 } = pkg;

const epsg3006 =
  '+proj=utm +zone=33 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs';

type FeatureMap = {
  [key: string]: Feature;
};

// ID FUNCTION

/*
 * This creates a vector tile source to be used by a maplibre in viewer, the different layers are represented in files below
 * Files can be regenerated if the features needs to be changed, for examples adding some more properties
 * Each feature NEEDS an integer id property so that maplibre can use feature state
 */
let idCount = 1; // generate ids incrementally
function getNewId() {
  const newId = idCount;
  idCount++;
  return newId;
}

// INDICATOR COLORS

// some buildings miss attributes, use this color:
const MISSING_ATTRIBUTE_COLOR = 'rgb(100, 100, 100)';

function setIndicatorColor(f: Feature, indicatorKeys: string[]) {
  for (const key of indicatorKeys) {
    // _ban (building are normalised) is already done in the original data
    if (f.properties[`${key}_ban`]) {
      f.properties[`${key}_bcol`] = getColorFromScale(
        f.properties[`${key}_ban`],
        key.startsWith('ge') ? 'buildingGhg' : 'buildingEnergy',
        true
      );
    } else {
      f.properties[`${key}_bcol`] = MISSING_ATTRIBUTE_COLOR;
    }
  }
}

// LOAD AND PROJECT

function loadAndProject(filePath) {
  return toWgs84(JSON.parse(fs.readFileSync(filePath, 'utf8')), epsg3006);
}

function assignId(featureCollection: FeatureCollection) {
  addProperty(featureCollection.features, 'id', () => getNewId());
  return featureCollection;
}

// COUNTERS

let numberOfBuildings2018 = 0;
let numberOfBuildings2050 = 0;
const fillWithBsmDataCounters: {
  [filePath: string]: number;
} = {};

// START FILLING UP FEATURE DATA >>>>>>>>> BUILDINGS

const buildings2018Map: FeatureMap = loadAndProject(
  './data/original/GBG_Basemap_2018.json'
).features.reduce((memo, feature) => {
  numberOfBuildings2018++;
  memo[feature.properties.UUID] = {
    type: 'Feature',
    properties: {
      id: getNewId(),
      UUID: feature.properties.UUID,
    },
    geometry: feature.geometry,
  };
  return memo;
}, {});

const buildings2050Map: FeatureMap = loadAndProject(
  './data/original/GBG_Basemap_2050.json'
).features.reduce((memo, feature) => {
  numberOfBuildings2050++;
  memo[feature.properties.UUID] = {
    type: 'Feature',
    properties: {
      id: getNewId(),
      UUID: feature.properties.UUID,
    },
    geometry: feature.geometry,
  };
  return memo;
}, {});

console.log('numberOfBuildings2018: ', numberOfBuildings2018);
console.log('numberOfBuildings2050: ', numberOfBuildings2050);

// THIS IS THE TILE DATA OBJECT TO ADD PROCESSED DATA TO >>>>>>>>>> ALSO PREPARE CONTEXT FEATURES (water, roads, trees)

const tileData: {
  [key: string]: FeatureCollection;
} = {
  water: assignId(loadAndProject('./data/context/water2018.json')),
  roads: assignId(loadAndProject('./data/context/roads2018.json')),
  trees: assignId(loadAndProject('./data/context/trees2018.json')),
  cityDistricts: assignId(
    loadAndProject('./data/boundaries/city_districts.json')
  ),
  baseAreas: assignId(loadAndProject('./data/boundaries/base_areas.json')),
  primaryAreas: assignId(
    loadAndProject('./data/boundaries/primary_areas.json')
  ),
  grid1km: assignId(loadAndProject('./data/boundaries/grid_1km.json')),
  grid250m: assignId(loadAndProject('./data/boundaries/grid_250m.json')),
  grid100m: assignId(loadAndProject('./data/boundaries/grid_100m.json')),
};

// MAIN FUNCTION

async function generateTiles() {
  // fill with base attributes, ref and climate
  await fillWithBSMData(
    './data/final/BSM_Results_DTCC_basemap_2018_ref.json',
    buildings2018Map,
    [...generalPropertyKeys, ...indicatorKeysRefAndClimate]
  );
  await fillWithBSMData(
    './data/final/BSM_Results_DTCC_basemap_2050_ref.json',
    buildings2050Map,
    [...generalPropertyKeys, ...indicatorKeysRefAndClimate]
  );
  // fill with renovation attributes
  await fillWithBSMData(
    './data/final/BSM_Results_DTCC_basemap_2018_scenario.json',
    buildings2018Map,
    indicatorKeysRenovation
  );
  await fillWithBSMData(
    './data/final/BSM_Results_DTCC_basemap_2050_scenario.json',
    buildings2050Map,
    indicatorKeysRenovation
  );

  console.log('fillWithBsmDataCounters: ', fillWithBsmDataCounters);

  tileData.buildings2018 = {
    type: 'FeatureCollection',
    features: Object.values(buildings2018Map),
  };
  tileData.buildings2050 = {
    type: 'FeatureCollection',
    features: Object.values(buildings2050Map),
  };

  assignColors(tileData.buildings2018.features);
  assignColors(tileData.buildings2050.features);

  setSegmentationToFeatures(
    tileData.buildings2018,
    tileData.cityDistricts,
    'cityDistricts'
  );
  setSegmentationToFeatures(
    tileData.buildings2050,
    tileData.cityDistricts,
    'cityDistricts'
  );
  setSegmentationToFeatures(
    tileData.buildings2018,
    tileData.baseAreas,
    'baseAreas'
  );
  setSegmentationToFeatures(
    tileData.buildings2050,
    tileData.baseAreas,
    'baseAreas'
  );
  setSegmentationToFeatures(
    tileData.buildings2018,
    tileData.primaryAreas,
    'primaryAreas'
  );
  setSegmentationToFeatures(
    tileData.buildings2050,
    tileData.primaryAreas,
    'primaryAreas'
  );
  setSegmentationToFeatures(
    tileData.buildings2018,
    tileData.grid1km,
    'grid1km'
  );
  setSegmentationToFeatures(
    tileData.buildings2050,
    tileData.grid1km,
    'grid1km'
  );
  setSegmentationToFeatures(
    tileData.buildings2018,
    tileData.grid250m,
    'grid250m'
  );
  setSegmentationToFeatures(
    tileData.buildings2050,
    tileData.grid250m,
    'grid250m'
  );
  setSegmentationToFeatures(
    tileData.buildings2018,
    tileData.grid100m,
    'grid100m'
  );
  setSegmentationToFeatures(
    tileData.buildings2050,
    tileData.grid100m,
    'grid100m'
  );
  // checkSegmentationData();
  checkPropertiesData();
  // writeTiles();
}

// START MAIN FUNCTION

await generateTiles();

async function fillWithBSMData(
  sourceFile: string,
  buildingsFeatureMap: FeatureMap,
  indicatorKeys: string[]
) {
  const readStream = fs.createReadStream(sourceFile);
  const parseStream = json.createParseStream();
  const totalKey = `${sourceFile}_total`;
  const foundKey = `${sourceFile}_found`;

  console.log('fillWithBSMData: ', sourceFile);
  console.log('indicatorKeys: ', indicatorKeys);

  await new Promise<void>((resolve, reject) => {
    parseStream.on('data', function (bsmPropertiesChunk) {
      for (const bsmProperties of bsmPropertiesChunk) {
        // count
        fillWithBsmDataCounters[totalKey] =
          fillWithBsmDataCounters[totalKey] || 0;
        fillWithBsmDataCounters[totalKey]++;
        // end count

        if (buildingsFeatureMap[bsmProperties.UUID]) {
          // count
          fillWithBsmDataCounters[foundKey] =
            fillWithBsmDataCounters[foundKey] || 0;
          fillWithBsmDataCounters[foundKey]++;
          // end count

          const buildingFeature = buildingsFeatureMap[bsmProperties.UUID];
          for (const key of indicatorKeys) {
            if (bsmProperties[key] !== undefined) {
              buildingFeature.properties[key] = bsmProperties[key];
            } else {
              console.log('missing key: ', key);
            }
          }
        }
      }
    });

    parseStream.on('end', () => {
      console.log('fillWithBSMData end');
      resolve();
    });

    readStream.on('error', err => {
      reject(err);
    });

    readStream.pipe(parseStream);
  });

  return;
}

function assignColors(features) {
  console.log('assign colors');
  // filter out keys that starts with the letter "m"
  const refAndClimateWithoutMonthlyValues = indicatorKeysRefAndClimate.filter(
    key => !key.startsWith('m')
  );
  const renovationWithoutMonthlyValues = indicatorKeysRenovation.filter(
    key => !key.startsWith('m')
  );
  const allIndicatorKeys = [
    ...refAndClimateWithoutMonthlyValues,
    ...renovationWithoutMonthlyValues,
  ];
  for (const feature of features) {
    setIndicatorColor(feature, allIndicatorKeys);
  }
}

export function prepareAggregatorData(
  indicatorKeys,
  featureCollection: FeatureCollection,
  segmentation: string
) {
  let aggregatorCounter = 0;
  console.log(`preparing aggregator data for ${segmentation}`);
  const data = aggregate(featureCollection, ['hfa', ...indicatorKeys], {
    segmentation,
  });
  for (const f of data.features) {
    aggregatorCounter++;
    // setIndicatorColorDistrict(f);
  }
  console.log('aggregatorCounter: ', aggregatorCounter);
  return data as FeatureCollection;
}

// SET SEGMENTATION FEATURE ID (district, grid, etc) TO FEATURES
// (the aggregation is moved to the client side, because of the query/filter calculations that needs this anyway)
function setSegmentationToFeatures(
  buildingFeatureCollection: FeatureCollection, // need to be already in EPSG:4326
  segmentationFeatureCollection: FeatureCollection, // need to be already in EPSG:4326
  segmentationKey: string
) {
  // prepare features to searchtree
  const buildingFeatures = buildingFeatureCollection.features;
  console.log(
    'add segmentation for buildingFeatures.length: ',
    buildingFeatures.length
  );
  let addCounter = 0;

  const searchItems = [];
  for (let i = 0; i < buildingFeatures.length; i++) {
    const [minX, minY, maxX, maxY] = bbox(buildingFeatures[i]);
    searchItems.push({
      minX,
      minY,
      maxX,
      maxY,
      i,
    });
  }
  const searchTree = new RBush();
  searchTree.load(searchItems);
  const segmentationFeatures = segmentationFeatureCollection.features;
  for (let i = 0; i < segmentationFeatures.length; i++) {
    const segmentationFeature = segmentationFeatures[i];
    const [minX, minY, maxX, maxY] = bbox(segmentationFeature);
    // first to a rough filtering
    const searchResult = searchTree.search({
      minX,
      minY,
      maxX,
      maxY,
    });
    // then check the results if inside segment
    for (let j = 0; j < searchResult.length; j++) {
      const feature = buildingFeatures[searchResult[j].i];
      const point = getPointFromFeature(feature);
      if (pointInPolygon(point, segmentationFeature)) {
        // add the segment ref to feature
        feature.properties[segmentationKey] = segmentationFeature.properties.id;
        addCounter++;
      }
    }
  }
  console.log('addCounter: ', addCounter);
  let notSegmentedCounter = 0;
  for (const f of buildingFeatures) {
    if (!f.properties[segmentationKey]) {
      notSegmentedCounter++;
    }
  }
  console.log('notSegmentedCounter: ', notSegmentedCounter);
}

function getPointFromFeature(feature: Feature) {
  // for now just take the first point in polygon (some kind of center would be better, but much slower)
  if (feature.geometry.type === 'Polygon') {
    return {
      type: 'Feature',
      geometry: {
        type: 'Point',
        coordinates: feature.geometry.coordinates[0][0],
      },
    };
  } else if (feature.geometry.type === 'MultiPolygon') {
    return {
      type: 'Feature',
      geometry: {
        type: 'Point',
        coordinates: feature.geometry.coordinates[0][0][0],
      },
    };
  }
  // do something about this later..
  console.log('crash: ', feature);
  return 'crash';
}

function pointInPolygon(pointFeature, polygonFeature) {
  return booleanPointInPolygon(pointFeature, polygonFeature);
}

function writeTiles() {
  console.log('generate tiles');
  saveToFolderStructure(tileData, {
    minZoom: 8,
    maxZoom: 16,
  });
}

function checkSegmentationData() {
  const indexes = [
    0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 1000, 1100, 1200, 1300, 1400, 1500,
  ];
  for (const i of indexes) {
    console.log(
      'buildings2018 example 1 ',
      tileData.buildings2018.features[i].properties.id
    );
    console.log(
      'cityDistricts',
      tileData.buildings2018.features[i].properties.cityDistricts
    );
    console.log(
      'baseAreas',
      tileData.buildings2018.features[i].properties.baseAreas
    );
    console.log(
      'primaryAreas',
      tileData.buildings2018.features[i].properties.primaryAreas
    );
    console.log(
      'grid1km',
      tileData.buildings2018.features[i].properties.grid1km
    );
    console.log(
      'grid250m',
      tileData.buildings2018.features[i].properties.grid250m
    );
    console.log(
      'grid100m',
      tileData.buildings2018.features[i].properties.grid100m
    );

    console.log(
      'buildings2050 example ',
      tileData.buildings2018.features[i].properties.id
    );
    console.log(
      'cityDistricts',
      tileData.buildings2050.features[i].properties.cityDistricts
    );
    console.log(
      'baseAreas',
      tileData.buildings2050.features[i].properties.baseAreas
    );
    console.log(
      'primaryAreas',
      tileData.buildings2050.features[i].properties.primaryAreas
    );
    console.log(
      'grid1km',
      tileData.buildings2050.features[i].properties.grid1km
    );
    console.log(
      'grid250m',
      tileData.buildings2050.features[i].properties.grid250m
    );
    console.log(
      'grid100m',
      tileData.buildings2050.features[i].properties.grid100m
    );
  }
}

function checkIndicatorValues() {
  const indexes = [
    0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 1000, 1100, 1200, 1300, 1400, 1500,
  ];
  for (const i of indexes) {
    console.log(
      'buildings2018 example 1 ',
      tileData.buildings2018.features[i].properties.id
    );
  }
}

function checkPropertiesData() {
  // console.log('buildings2018 example 1 ');
  // console.log(tileData.buildings2018.features[0].properties);
  // console.log('buildings2018 example 2 ');
  // console.log(tileData.buildings2018.features[1000].properties);
  // console.log('buildings2018 example 3 ');
  // console.log(tileData.buildings2018.features[10000].properties);

  // console.log('buildings2050 example 1 ');
  // console.log(tileData.buildings2050.features[0].properties);
  // console.log('buildings2050 example 2 ');
  // console.log(tileData.buildings2050.features[1000].properties);
  // console.log('buildings2050 example 3 ');
  // console.log(tileData.buildings2050.features[10000].properties);
  const allIndicatorKeys = [
    ...generalPropertyKeys,
    ...indicatorKeysRefAndClimate,
    ...indicatorKeysRenovation,
  ];
  const missingIndicatorValues2018 = {};
  const foundIndicatorValues2018 = {};
  const missingIndicatorValues2050 = {};
  const foundIndicatorValues2050 = {};
  for (const indicatorKey of allIndicatorKeys) {
    console.log('indicatorKey: ', indicatorKey);
    for (const f of tileData.buildings2018.features) {
      if (f.properties[indicatorKey] === undefined) {
        missingIndicatorValues2018[indicatorKey] =
          missingIndicatorValues2018[indicatorKey] || 0;
        missingIndicatorValues2018[indicatorKey]++;
      } else {
        foundIndicatorValues2018[indicatorKey] =
          foundIndicatorValues2018[indicatorKey] || 0;
        foundIndicatorValues2018[indicatorKey]++;
      }
    }
    for (const f of tileData.buildings2050.features) {
      if (f.properties[indicatorKey] === undefined) {
        missingIndicatorValues2050[indicatorKey] =
          missingIndicatorValues2050[indicatorKey] || 0;
        missingIndicatorValues2050[indicatorKey]++;
      } else {
        foundIndicatorValues2050[indicatorKey] =
          foundIndicatorValues2050[indicatorKey] || 0;
        foundIndicatorValues2050[indicatorKey]++;
      }
    }
  }
  console.log('missingIndicatorValues2018: ', missingIndicatorValues2018);
  console.log('foundIndicatorValues2018: ', foundIndicatorValues2018);
  console.log('missingIndicatorValues2050: ', missingIndicatorValues2050);
  console.log('foundIndicatorValues2050: ', foundIndicatorValues2050);
}
