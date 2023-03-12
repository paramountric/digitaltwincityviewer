import fs from 'fs-extra';
import { resolve } from 'path';
import pkg from 'reproject';
import { addProperty, FeatureCollection, Feature } from '@dtcv/geojson';
import { aggregate } from './aggregator.js';
import { getColorFromScale } from './colorScales.js';

export function copyProperties(
  toFeatures: Feature[],
  fromFeatures: Feature[],
  propertyKeys: string[],
  idKey: string,
  prefix?: string,
  postfix?: string
) {
  try {
    // put all properties in a map
    const propertyMap = {};
    for (const fromFeature of fromFeatures) {
      propertyMap[fromFeature.properties[idKey]] = fromFeature.properties;
    }
    // assign the properties to the features
    for (const toFeature of toFeatures) {
      const fromProperties = propertyMap[toFeature.properties[idKey]];
      // if properties in fromFeatures was found for this toFeature
      if (fromProperties) {
        for (const propertyKey of propertyKeys) {
          const value = fromProperties[propertyKey];
          if (value || value === 0) {
            toFeature.properties[
              `${prefix || ''}${propertyKey}${postfix || ''}`
            ] = value;
          }
        }
      }
    }
    return toFeatures;
  } catch (err) {
    console.warn('Error in copyProperties function', err);
  }
}

const { toWgs84 } = pkg;

// ! properties are not copied property after loading several BSM climate files, the property keys need to be postfixed with the climate temp

// this file is an example on data preparation for the dte-digital-twin-energy project
// the output of this should go read the generate-tiles script

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

const indicators = [
  'finalEnergy',
  'deliveredEnergy',
  'primaryEnergy',
  'ghgEmissions',
  'heatDemand',
  'coolingDemand',
];

// todo: how to deal with this? Needs climate scenario, but should not be divided by area?
const monthyIndicators = [
  'monthlyFinalEnergy2018',
  'monthlyFinalEnergy2030',
  'monthlyFinalEnergy2050',
  'monthlyHeatDemand2018',
  'monthlyHeatDemand2030',
  'monthlyHeatDemand2050',
  'monthlyCoolingDemand2018',
  'monthlyCoolingDemand2030',
  'monthlyCoolingDemand2050',
];

const indicatorsWithYear = indicators.reduce((memo, key) => {
  memo.push(`${key}2018`);
  memo.push(`${key}2030`);
  memo.push(`${key}2050`);
  return memo;
}, []);

// const indicatorsWithClimateTemp = indicatorsWithYear.reduce((memo, key) => {
//   memo.push(`${key}_2_5`);
//   memo.push(`${key}_4_5`);
//   memo.push(`${key}_8_5`);
//   return memo;
// }, []);

// use these to prepare colors
const BSM_ATTRIBUTE_INDICATORS = indicatorsWithYear;

const BSM_ATTRIBUTE_INDICATORS_DEGREES = BSM_ATTRIBUTE_INDICATORS.reduce(
  (memo, key) => {
    memo.push(`${key}_climate_2_5`);
    memo.push(`${key}_climate_4_5`);
    memo.push(`${key}_climate_8_5`);
    return memo;
  },
  []
);

console.log(BSM_ATTRIBUTE_INDICATORS);

// copy these from the BSM file to the features
const BSM_ATTRIBUTES = [
  'UUID',
  // 'Height', // this is a string, so either build a parser for converting or require the original data to be correct
  // 'GroundHeight', // same as above
  'address',
  'postPlace',
  'postCode',
  'heatedFloorArea',
];
// some buildings miss attributes, use this color:
const MISSING_ATTRIBUTE_COLOR = 'rgb(100, 100, 100)';

let numMissing = 0;
let numExisting = 0;

function assignBsmStatisticsForBuilding(f, postfix) {
  // Note: when the bsm data was copied to the features the postfix was added
  BSM_ATTRIBUTE_INDICATORS.forEach(a => {
    const indicatorWithPostfix = `${a}${postfix}`;
    if (
      f.properties.heatedFloorArea &&
      (f.properties[indicatorWithPostfix] ||
        f.properties[indicatorWithPostfix] === 0)
    ) {
      numExisting++;
      const valuePerBuildingArea =
        f.properties[indicatorWithPostfix] / f.properties.heatedFloorArea;
      f.properties[`${indicatorWithPostfix}BuildingAreaNorm`] =
        valuePerBuildingArea;
      f.properties[`${indicatorWithPostfix}BuildingAreaColor`] =
        getColorFromScale(
          valuePerBuildingArea,
          indicatorWithPostfix.startsWith('ghgEmissions')
            ? 'buildingGhg'
            : 'buildingEnergy',
          true
        );
    } else {
      numMissing++;
      //console.log('missing', indicatorWithPostfix, f.properties.UUID);
      f.properties[`${indicatorWithPostfix}BuildingAreaColor`] =
        MISSING_ATTRIBUTE_COLOR;
    }
  });
}

function assignBsmStatisticsForDistrict(f) {
  BSM_ATTRIBUTE_INDICATORS_DEGREES.forEach(a => {
    if (
      f.properties.area && // area comes from the district aggregation features
      (f.properties[a] || f.properties[a] === 0) // the value must be aggregated (summed) first from buildings inside
    ) {
      const valuePerDistrictArea = f.properties[a] / f.properties.area;
      // ! note that the variable name is misleading, it is not the area of the building, but the area of the district
      // ! previously the "DistrictAreaNorm" was used, however just to make it easier on the frontend with layers..
      f.properties[`${a}BuildingAreaNorm`] = valuePerDistrictArea;
      f.properties[`${a}BuildingAreaColor`] = getColorFromScale(
        valuePerDistrictArea,
        a.startsWith('ghgEmissions') ? 'districtGhg' : 'districtEnergy',
        true
      );
    } else {
      f.properties[`${a}BuildingAreaColor`] = MISSING_ATTRIBUTE_COLOR;
    }
  });
}

export function addBsmDataToFeatures(
  inputFilePathBuildings: string, // one geometry file per layer
  inputFilePathBSM: string[][], // add several files of BSM data to one layer
  outputFilePath: string, // one output file per layer, to be read by the generate-tiles script
  propertyKeyListToCopy: string[],
  propertyKeyListToCopyIndicators: string[]
): FeatureCollection {
  const buildings = JSON.parse(
    fs.readFileSync(resolve('../../data/', inputFilePathBuildings), 'utf8')
  );
  // buildings needs an integer id for maplibre
  addProperty(buildings.features, 'id', () => getNewId());
  // all features need to be in EPSG:4326
  const epsg3006 =
    '+proj=utm +zone=33 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs';
  const projectedBuildings = toWgs84(buildings, epsg3006);

  const outputFeatureCollection = {
    type: 'FeatureCollection',
    features: projectedBuildings.features,
  } as FeatureCollection;

  for (const filePathBSM of inputFilePathBSM) {
    console.log(filePathBSM);
    // read the BSM data
    const BSM = JSON.parse(
      fs.readFileSync(resolve('../../data/', filePathBSM[1]), 'utf8')
    );
    const bsmFeatures = BSM.map(properties => ({
      type: 'Feature',
      properties,
    }));
    // ! note that reference is used here, it copies data from the BSM files by reference,
    // ! and then mutate the statistical data below

    // this will be overridden for each file if same
    copyProperties(
      projectedBuildings.features,
      bsmFeatures,
      propertyKeyListToCopy,
      'UUID'
    );
    // this will use the given postfix to add the climate scenario data
    copyProperties(
      projectedBuildings.features,
      bsmFeatures,
      propertyKeyListToCopyIndicators,
      'UUID',
      '',
      filePathBSM[0]
    );
    for (const building of projectedBuildings.features) {
      assignBsmStatisticsForBuilding(building, filePathBSM[0]);
    }
    console.log(numMissing, numExisting);
  }

  // ! need to stream the data to file because json.stringify(too_big_file) uses too much memory

  return outputFeatureCollection;

  // fs.writeJson(
  //   resolve('../../data/', outputFilePath),
  //   outputFeatureCollection
  // ).then(() => console.log('prepared data was written to disk'));

  // fs.writeFileSync(
  //   resolve('../../data/', outputFilePath),
  //   JSON.stringify(outputFeatureCollection)
  // );
}

export function prepareDataBuildings2018(): FeatureCollection {
  return addBsmDataToFeatures(
    './original/GBG_Basemap_2018.json',
    [
      [
        '_climate_2_5', // postfix to properties
        './original/BSM_Results_DTCC_basemap_2018_climate_2_5.json',
      ],
      [
        '_climate_4_5', // postfix to properties
        './original/BSM_Results_DTCC_basemap_2018_climate_4_5.json',
      ],
      [
        '_climate_8_5', // postfix to properties
        './original/BSM_Results_DTCC_basemap_2018_climate_8_5.json',
      ],
    ],
    './prepared/buildings_2018.json',
    BSM_ATTRIBUTES,
    BSM_ATTRIBUTE_INDICATORS
  );
}

export function prepareDataBuildings2050(): FeatureCollection {
  return addBsmDataToFeatures(
    './original/GBG_Basemap_2050.json',
    [
      [
        '_climate_2_5', // postfix to properties
        './original/BSM_Results_DTCC_basemap_2050_climate_2_5.json',
      ],
      [
        '_climate_4_5', // postfix to properties
        './original/BSM_Results_DTCC_basemap_2050_climate_4_5.json',
      ],
      [
        '_climate_8_5', // postfix to properties
        './original/BSM_Results_DTCC_basemap_2050_climate_8_5.json',
      ],
    ],
    './prepared/buildings_2050.json',
    BSM_ATTRIBUTES,
    BSM_ATTRIBUTE_INDICATORS
  );
}

export function prepareWater(): FeatureCollection {
  const water = JSON.parse(
    fs.readFileSync(resolve('../../data/', './original/water2018.json'), 'utf8')
  );
  const epsg3006 =
    '+proj=utm +zone=33 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs';
  const projectedWater = toWgs84(water, epsg3006);
  return projectedWater;
}

export function prepareRoads(): FeatureCollection {
  const roads = JSON.parse(
    fs.readFileSync(resolve('../../data/', './original/roads2018.json'), 'utf8')
  );
  const epsg3006 =
    '+proj=utm +zone=33 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs';
  const projectedRoads = toWgs84(roads, epsg3006);
  return projectedRoads;
}

export function prepareTrees(): FeatureCollection {
  const trees = JSON.parse(
    fs.readFileSync(resolve('../../data/', './original/trees2018.json'), 'utf8')
  );
  const epsg3006 =
    '+proj=utm +zone=33 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs';
  const projectedTrees = toWgs84(trees, epsg3006);
  return projectedTrees;
}

// This function reads the original data from file and add the additional attributes on the features
// It will also aggregate some of the attribute values onto the aggregation datasets
// ! note that this doesn't work for larger files (json.stringify), and requires streaming
// ! atm it is not used, but it is left here for reference -> use in-memory pipeline from generate-tiles
export function prepareData() {
  console.log('prepare and write 2018 to file...');
  addBsmDataToFeatures(
    './original/GBG_Basemap_2018.json',
    [
      [
        '_climate_2_5', // prefix to properties
        './original/BSM_Results_DTCC_basemap_2018_climate_2_5.json',
      ],
      [
        '_climate_4_5', // prefix to properties
        './original/BSM_Results_DTCC_basemap_2018_climate_4_5.json',
      ],
      [
        '_climate_8_5', // prefix to properties
        './original/BSM_Results_DTCC_basemap_2018_climate_8_5.json',
      ],
    ],
    './prepared/buildings_2018.json',
    BSM_ATTRIBUTES,
    BSM_ATTRIBUTE_INDICATORS
  );
  console.log('prepare and write 2050 to file...');
  addBsmDataToFeatures(
    './original/GBG_Basemap_2050.json',
    [
      [
        '_climate_2_5', // prefix to properties
        './original/BSM_Results_DTCC_basemap_2050_climate_2_5.json',
      ],
      [
        '_climate_4_5', // prefix to properties
        './original/BSM_Results_DTCC_basemap_2050_climate_4_5.json',
      ],
      [
        '_climate_8_5', // prefix to properties
        './original/BSM_Results_DTCC_basemap_2050_climate_8_5.json',
      ],
    ],
    './prepared/buildings_2050.json',
    BSM_ATTRIBUTES,
    BSM_ATTRIBUTE_INDICATORS
  );
}

export function prepareAggregatorData(
  featureCollection: FeatureCollection,
  segmentation: string
) {
  console.log(`preparing aggregator data for ${segmentation}`);
  console.log('Mem: ', process.memoryUsage());
  const data = aggregate(
    featureCollection,
    ['heatedFloorArea', ...BSM_ATTRIBUTE_INDICATORS_DEGREES],
    {
      segmentation,
    }
  );
  data.features.forEach(f => {
    // dont delete as it can be used in ui
    // for (const indicator of BSM_ATTRIBUTE_INDICATORS_DEGREES) {
    //   delete f.properties[`${indicator}Sum`];
    //   delete f.properties[`${indicator}Count`];
    // }
    f.properties.id = getNewId();
    assignBsmStatisticsForDistrict(f);
  });

  return data as FeatureCollection;
}

export function prepareGrid1Km(cityModelGeoJson: FeatureCollection) {
  console.log('preparing grid 1km');
  const grid1km = aggregate(
    cityModelGeoJson,
    ['heatedFloorArea', ...BSM_ATTRIBUTE_INDICATORS_DEGREES],
    {
      segmentation: 'grid1km',
    }
  );
  grid1km.features.forEach(f => {
    // dont delete as it can be used in ui
    // for (const indicator of BSM_ATTRIBUTE_INDICATORS_DEGREES) {
    //   delete f.properties[`${indicator}Sum`];
    //   delete f.properties[`${indicator}Count`];
    // }
    f.properties.id = getNewId();
    assignBsmStatisticsForDistrict(f);
  });

  return grid1km as FeatureCollection;
  //fs.writeFileSync('data/grid1km.geojson', JSON.stringify(grid1km));
}

export function prepareGrid250m(cityModelGeoJson: FeatureCollection) {
  console.log('preparing grid 250m');
  const grid250m = aggregate(
    cityModelGeoJson,
    ['heatedFloorArea', ...BSM_ATTRIBUTE_INDICATORS_DEGREES],
    {
      segmentation: 'grid250m',
    }
  );
  grid250m.features.forEach(f => {
    // dont delete as it can be used in ui
    // for (const indicator of BSM_ATTRIBUTE_INDICATORS_DEGREES) {
    //   delete f.properties[`${indicator}Sum`];
    //   delete f.properties[`${indicator}Count`];
    // }
    f.properties.id = getNewId();
    assignBsmStatisticsForDistrict(f);
  });

  return grid250m as FeatureCollection;
  //fs.writeFileSync('data/grid1km.geojson', JSON.stringify(grid1km));
}

export function prepareGrid100m(cityModelGeoJson: FeatureCollection) {
  console.log('preparing grid 100m');
  const grid100m = aggregate(
    cityModelGeoJson,
    ['heatedFloorArea', ...BSM_ATTRIBUTE_INDICATORS_DEGREES],
    {
      segmentation: 'grid100m',
    }
  );
  grid100m.features.forEach(f => {
    // dont delete as it can be used in ui
    // for (const indicator of BSM_ATTRIBUTE_INDICATORS_DEGREES) {
    //   delete f.properties[`${indicator}Sum`];
    //   delete f.properties[`${indicator}Count`];
    // }
    f.properties.id = getNewId();
    assignBsmStatisticsForDistrict(f);
  });

  return grid100m as FeatureCollection;
  //fs.writeFileSync('data/grid1km.geojson', JSON.stringify(grid1km));
}

export function prepareCityDistricts(cityModelGeoJson: FeatureCollection) {
  console.log('preparing city districts');
  const cityDistricts = aggregate(
    cityModelGeoJson,
    ['heatedFloorArea', ...BSM_ATTRIBUTE_INDICATORS_DEGREES],
    {
      segmentation: 'cityDistricts',
    }
  );
  cityDistricts.features.forEach(f => {
    // dont delete as it can be used in ui
    // for (const indicator of BSM_ATTRIBUTE_INDICATORS_DEGREES) {
    //   delete f.properties[`${indicator}Sum`];
    //   delete f.properties[`${indicator}Count`];
    // }
    f.properties.id = getNewId();
    assignBsmStatisticsForDistrict(f);
  });

  return cityDistricts as FeatureCollection;
  //fs.writeFileSync('data/grid1km.geojson', JSON.stringify(grid1km));
}

export function prepareBaseAreas(cityModelGeoJson: FeatureCollection) {
  console.log('preparing base areas');
  const baseAreas = aggregate(
    cityModelGeoJson,
    ['heatedFloorArea', ...BSM_ATTRIBUTE_INDICATORS_DEGREES],
    {
      segmentation: 'baseAreas',
    }
  );
  baseAreas.features.forEach(f => {
    // dont delete as it can be used in ui
    // for (const indicator of BSM_ATTRIBUTE_INDICATORS_DEGREES) {
    //   delete f.properties[`${indicator}Sum`];
    //   delete f.properties[`${indicator}Count`];
    // }
    f.properties.id = getNewId();
    assignBsmStatisticsForDistrict(f);
  });

  return baseAreas as FeatureCollection;
  //fs.writeFileSync('data/grid1km.geojson', JSON.stringify(grid1km));
}
