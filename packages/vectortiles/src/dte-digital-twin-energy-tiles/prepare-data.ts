import fs from 'fs-extra';
import { resolve } from 'path';
import pkg from 'reproject';
import { addProperty, copyProperties, FeatureCollection } from '@dtcv/geojson';
import { aggregate } from './aggregator.js';
import { getColorFromScale } from './colorScales.js';

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

function assignBsmStatisticsForBuilding(f, postfix) {
  // Note: when the bsm data was copied to the features the postfix was added
  BSM_ATTRIBUTE_INDICATORS.forEach(a => {
    const indicatorWithPostfix = `${a}${postfix}`;
    if (
      f.properties.heatedFloorArea &&
      (f.properties[indicatorWithPostfix] ||
        f.properties[indicatorWithPostfix] === 0)
    ) {
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
      f.properties[`${indicatorWithPostfix}BuildingAreaColor`] =
        MISSING_ATTRIBUTE_COLOR;
    }
  });
}

function assignBsmStatisticsForDistrict(f) {
  BSM_ATTRIBUTE_INDICATORS.forEach(a => {
    if (
      f.properties.area && // area comes from the district aggregation features
      (f.properties[a] || f.properties[a] === 0) // the value must be aggregated (summed) first from buildings inside
    ) {
      const valuePerDistrictArea = f.properties[a] / f.properties.area;
      f.properties[`${a}DistrictAreaNorm`] = valuePerDistrictArea;
      f.properties[`${a}DistrictAreaColor`] = getColorFromScale(
        valuePerDistrictArea,
        a.startsWith('ghgEmissions') ? 'districtGhg' : 'districtEnergy'
      );
    } else {
      f.properties[`${a}DistrictAreaColor`] = MISSING_ATTRIBUTE_COLOR;
    }
  });
}

export function addBsmDataToFeatures(
  inputFilePathBuildings: string, // one geometry file per layer
  inputFilePathBSM: string[][], // add several files of BSM data to one layer
  outputFilePath: string, // one output file per layer, to be read by the generate-tiles script
  propertyKeyListToCopy: string[],
  propertyKeyListToCopyIndicators: string[]
) {
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

export function prepareDataBuildings2018() {
  return addBsmDataToFeatures(
    './original/GBG_Basemap_2018_universeum.json',
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

export function prepareDataBuildings2050() {
  return addBsmDataToFeatures(
    './original/GBG_Basemap_2050_universeum.json',
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

export function prepareWater() {
  const water = JSON.parse(
    fs.readFileSync(resolve('../../data/', './original/water2018.json'), 'utf8')
  );
  const epsg3006 =
    '+proj=utm +zone=33 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs';
  const projectedWater = toWgs84(water, epsg3006);
  return projectedWater;
}

export function prepareRoads() {
  const roads = JSON.parse(
    fs.readFileSync(resolve('../../data/', './original/roads2018.json'), 'utf8')
  );
  const epsg3006 =
    '+proj=utm +zone=33 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs';
  const projectedRoads = toWgs84(roads, epsg3006);
  return projectedRoads;
}

export function prepareTrees() {
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

  // // aggregate buildings on 1 km
  // let grid1km;
  // if (usePreparedFiles.grid1km) {
  //   grid1km = JSON.parse(fs.readFileSync('data/grid1km.geojson', 'utf8'));
  // } else {
  //   console.log('preparing grid 1km');
  //   console.log(process.memoryUsage());
  //   grid1km = aggregate(cityModelGeoJson, BSM_ATTRIBUTES, {
  //     segmentation: 'grid1km',
  //   });
  // }
  // grid1km.features.forEach(f => {
  //   f.properties.id = getNewId();
  //   assignBsmStatistics(f);
  // });
  // fs.writeFileSync('data/grid1km.geojson', JSON.stringify(grid1km));

  // // aggregate buildings on 250 m
  // let grid250m;
  // if (usePreparedFiles.grid250m) {
  //   grid250m = JSON.parse(fs.readFileSync('data/grid250m.geojson', 'utf8'));
  // } else {
  //   console.log('preparing grid 250m');
  //   console.log(process.memoryUsage());
  //   grid250m = aggregate(cityModelGeoJson, BSM_ATTRIBUTES, {
  //     segmentation: 'grid250m',
  //   });
  // }
  // grid250m.features.forEach(f => {
  //   f.properties.id = getNewId();
  //   assignBsmStatistics(f);
  // });
  // fs.writeFileSync('data/grid250m.geojson', JSON.stringify(grid250m));

  // // // aggregate buildings on 100 m
  // let grid100m;
  // if (usePreparedFiles.grid100m) {
  //   grid100m = JSON.parse(fs.readFileSync('data/grid100m.geojson', 'utf8'));
  // } else {
  //   console.log('preparing grid 100m');
  //   console.log(process.memoryUsage());
  //   grid100m = aggregate(cityModelGeoJson, BSM_ATTRIBUTES, {
  //     segmentation: 'grid100m',
  //   });
  // }
  // grid100m.features.forEach(f => {
  //   f.properties.id = getNewId();
  //   assignBsmStatistics(f);
  // });
  // fs.writeFileSync('data/grid100m.geojson', JSON.stringify(grid100m));

  // // aggregate buildings on base area
  // let baseAreas;
  // if (usePreparedFiles.baseAreas) {
  //   baseAreas = JSON.parse(fs.readFileSync('data/baseAreas.geojson', 'utf8'));
  // } else {
  //   console.log('preparing baseAreas');
  //   console.log(process.memoryUsage());
  //   baseAreas = aggregate(cityModelGeoJson, BSM_ATTRIBUTES, {
  //     segmentation: 'baseAreas',
  //   });
  // }
  // baseAreas.features.forEach(f => {
  //   f.properties.id = getNewId();
  //   assignBsmStatistics(f);
  // });
  // fs.writeFileSync('data/baseAreas.geojson', JSON.stringify(baseAreas));

  // // aggregate buildings on city district
  // let cityDistricts;
  // if (usePreparedFiles.cityDistricts) {
  //   cityDistricts = JSON.parse(
  //     fs.readFileSync('data/cityDistricts.geojson', 'utf8')
  //   );
  // } else {
  //   console.log('preparing cityDistricts');
  //   console.log(process.memoryUsage());
  //   cityDistricts = aggregate(cityModelGeoJson, BSM_ATTRIBUTES, {
  //     segmentation: 'cityDistricts',
  //   });
  // }
  // cityDistricts.features.forEach(f => {
  //   f.properties.id = getNewId();
  //   assignBsmStatistics(f);
  // });
  // fs.writeFileSync('data/cityDistricts.geojson', JSON.stringify(cityDistricts));

  // let primaryAreas;
  // if (usePreparedFiles.primaryAreas) {
  //   primaryAreas = JSON.parse(
  //     fs.readFileSync('data/primaryAreas.geojson', 'utf8')
  //   );
  // } else {
  //   console.log('preparing primaryAreas');
  //   console.log(process.memoryUsage());
  //   primaryAreas = aggregate(cityModelGeoJson, BSM_ATTRIBUTES, {
  //     segmentation: 'primaryAreas',
  //   });
  // }
  // primaryAreas.features.forEach(f => {
  //   f.properties.id = getNewId();
  //   assignBsmStatistics(f);
  // });
  // fs.writeFileSync('data/primaryAreas.geojson', JSON.stringify(primaryAreas));
  // // aggregate buildings on primary area
  // let primaryAreas;
  // if (usePreparedFiles.primaryAreas) {
  //   primaryAreas = JSON.parse(fs.readFileSync('data/primaryAreas.geojson', 'utf8'));
  // } else {
  //   console.log('preparing primaryAreas');
  //   console.log(process.memoryUsage());
  //   const primaryAreas = aggregate(cityModelGeoJson, BSM_ATTRIBUTES, { segmentation: 'primaryAreas' });
  //   primaryAreas.features.forEach(f => {
  //     f.properties.color = indicators.generateColor(f.properties.deliveredEnergy / f.properties.heatedFloorArea, 100, 50);
  //   });
  //   fs.writeFileSync('data/primaryAreas.geojson', JSON.stringify(primaryAreas));
  // }

  // const tileLayers = {
  //   cityModel: cityModelGeoJson,
  //   roadNetwork: roadNetworkGeoJson,
  //   landDataArea: landDataAreaGeoJson,
  //   grid1km,
  //   grid100m,
  //   grid250m,
  //   baseAreas,
  //   cityDistricts,
  //   primaryAreas,
  // };

  // return tileLayers;
}

prepareData();
