import fs from 'fs';
import { resolve } from 'path';
import pkg from 'reproject';
import { addProperty, copyProperties } from '@dtcv/geojson';
import { aggregate } from './aggregator.js';
import { getColorFromScale } from './colorScales.js';

const { toWgs84 } = pkg;

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

const BSM_ATTRIBUTE_INDICATORS = [
  'finalEnergy',
  'deliveredEnergy',
  'primaryEnergy',
  'ghgEmissions',
  'coolingDemand',
];
const BSM_ATTRIBUTES = ['heatedFloorArea', ...BSM_ATTRIBUTE_INDICATORS];
// some buildings miss attributes, use this color:
const MISSING_ATTRIBUTE_COLOR = 'rgb(100, 100, 100)';

function assignBsmStatistics(f) {
  BSM_ATTRIBUTE_INDICATORS.forEach(a => {
    if (f.properties[a] || f.properties[a] === 0) {
      const valuePerDistrictArea = f.properties[a] / f.properties.area;
      const valuePerBuildingArea =
        f.properties[a] / f.properties.heatedFloorArea;
      f.properties[`${a}DistrictAreaNorm`] = valuePerDistrictArea;
      f.properties[`${a}BuildingAreaNorm`] = valuePerBuildingArea;
      f.properties[`${a}DistrictAreaColor`] = getColorFromScale(
        valuePerDistrictArea,
        a === 'ghgEmissions' ? 'districtGhg' : 'districtEnergy'
      );
      f.properties[`${a}BuildingAreaColor`] = getColorFromScale(
        valuePerBuildingArea,
        a === 'ghgEmissions' ? 'buildingGhg' : 'energyDeclaration'
      );
    } else {
      f.properties[`${a}DistrictAreaColor`] = MISSING_ATTRIBUTE_COLOR;
      f.properties[`${a}BuildingAreaColor`] = MISSING_ATTRIBUTE_COLOR;
    }
  });
}

function addBsmDataToFeatures(
  inputFilePathBuildings,
  inputFilePathBSM,
  outputFilePath,
  propertyMapping
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
  // read the BSM data
  const BSM = JSON.parse(
    fs.readFileSync(resolve('../../data/', inputFilePathBSM), 'utf8')
  );
  const bsmFeatures = BSM.map(properties => ({ type: 'Feature', properties }));
  const buildingsWithBSM = copyProperties(
    projectedBuildings.features,
    bsmFeatures,
    propertyMapping,
    'UUID'
  );
  for (const building of buildingsWithBSM) {
    assignBsmStatistics(building);
  }

  fs.writeFileSync(
    resolve('../../data/', outputFilePath),
    JSON.stringify({
      type: 'FeatureCollection',
      features: buildingsWithBSM,
    })
  );
}

// This function reads the original data from file and add the additional attributes on the features
// It will also aggregate some of the attribute values onto the aggregation datasets
export function prepareData() {
  console.log('prepare and write 2018 to file...');
  addBsmDataToFeatures(
    './original/GBG_Basemap_2018_universeum.json',
    './original/BSM_Results_DTCC_basemap_2018_climate_2_5.json',
    './prepared/buildings_2018.json',
    [
      'address',
      'postPlace',
      'postCode',
      'heatedFloorArea',
      'heatDemand2018',
      'finalEnergy2018',
      'deliveredEnergy2018',
      'primaryEnergy2018',
      'ghgEmissions2018',
      'heatDemand2050',
      'finalEnergy2050',
      'deliveredEnergy2050',
      'primaryEnergy2050',
      'ghgEmissions2050',
    ]
  );
  console.log('prepare and write 2050 to file...');
  addBsmDataToFeatures(
    './original/GBG_Basemap_2050_universeum.json',
    './original/BSM_Results_DTCC_basemap_2050_climate_2_5.json',
    './prepared/buildings_2050.json',
    [
      'address',
      'postPlace',
      'postCode',
      'heatedFloorArea',
      'heatDemand2018',
      'finalEnergy2018',
      'deliveredEnergy2018',
      'primaryEnergy2018',
      'ghgEmissions2018',
      'heatDemand2050',
      'finalEnergy2050',
      'deliveredEnergy2050',
      'primaryEnergy2050',
      'ghgEmissions2050',
    ]
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
