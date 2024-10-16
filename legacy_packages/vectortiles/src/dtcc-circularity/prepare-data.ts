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

const selectedCatergoricalPropertyKeys = [
  'OBJECTID',
  'TYP',
  'rnpregby',
  'ridregby',
  'fnr',
  'husnr',
  'xkoordl',
  'ykoordl',
  'Byggdetalj',
  'Byggenkel',
  'NybyggÃ¥',
  'Shape_Leng',
  'Shape_Area',
  'yr_count',
  'yr_mean',
  'height_cou',
  'height_mea',
  'OBJECTID_2',
  'Building',
  'Residentia',
  'Types',
  'Shape_Le_1',
  'Shape_Ar_1',
  'Constructe',
  'Height_Bui',
  'height_flo',
  'Floors',
];

const selectedNumericPropertyKeys = [
  'Bottomslab',
  'Concrete_f',
  'Sawdust_li',
  'Lime mix p',
  'Floorboard',
  'Panel_Kg',
  'Insulation',
  'Syll_Kg',
  'Tot_wt_Bot',
  'Area_Exter',
  'Horizontal',
  'In_panels',
  'Fiberboard',
  'Particle_b',
  'WoodBeamsH',
  'Wood Beams',
  'Syll',
  'Sawdust',
  'Vertical_p',
  'Carboard',
  'Panels_out',
  'Panels out',
  'Panels_o_1',
  'Plaster_bo',
  'Porus_fibe',
  'Insulati_1',
  'Tar_paper',
  'Foil',
  'Grout',
  'Bricks',
  'Tot_wt_ext',
  'Wood_wt_pe',
  'Total_wood',
  'Glass',
  'Total_glas',
  'Tot_wt_gla',
  'Truss',
  'Panelling_',
  'Sheet_meta',
  'Tile',
  'Lath',
  'Syll_1',
  'Sheet_coop',
  'Panel',
  'Tar_paper_',
  'Insulati_2',
  'Concrete_t',
  'Total_wt_r',
  'Wooden_bea',
  'Saw_dust_l',
  'Floorboa_1',
  'Panels',
  'Cokeash',
  'Tar paper',
  'Cellar_sla',
  'Tiers_wood',
  'Sawdust_1',
  'Syll_2',
  'Total_weig',
  'Bricks [Kg',
  'Total_wt _',
  'Concrete f',
  'Wood wool',
  'Plaster [K',
  'Leca [Kg]',
  'Porus fibe',
  'Bricks [_1',
  'Total_we_1',
  'Plank',
  'Vertical_w',
  'Panel_ext',
  'Panels_int',
  'Wood_Beams',
  'Wood_Bea_1',
  'Syll_3',
  'Sawdust_2',
  'Diagonal_b',
  'Vertical_b',
  'Bricks_1',
  'Mortar',
  'Plaster_in',
  'Plaster_ex',
  'Asphat_pap',
  'Porus_fi_1',
  'Reeds',
  'Standing_p',
  'Paper',
  'Cardboard',
  'Total_wt_w',
  'Panels_in',
  'Plaster__1',
  'Plaster__2',
  'Diagonal_1',
  'Bricks_2',
  'Sawdust_3',
  'Vertical_1',
  'Cardboard_',
  'Porus_fi_2',
  'Asphat_p_1',
  'Total_wt_b',
  'Wood panel',
  'Lightweigh',
  'Bricks_3',
  'Wood woo_1',
  'Wood bea_1',
  'Mineral wo',
  'Plaster in',
  'Plaster ex',
  'Asbestos c',
  'Insulati_3',
  'Total_wt_c',
  'Truss_1',
  'Panelling',
  'Tile_1',
  'Carboard_1',
  'Sheet coop',
  'Sheet meta',
  'Lath_1',
  'Total_wt_1',
  'Truss_2',
  'Panellin_1',
  'Tile_2',
  'Carboard_2',
  'Lath_2',
  'Sheet me_1',
  'Total_wt_2',
  'Truss_3',
  'Wood_panel',
  'Tile_3',
  'Cardboar_1',
  'Lath_3',
  'Cork insul',
  'ESP insula',
  'Metal shee',
  'Concrete t',
  'Lath_4',
  'Total_wt_3',
  'Wt_wood_pe',
  'Total_we_2',
  'Glass_weig',
  'Total_gl_1',
  'Tot_glass_',
  'Wood_wt__1',
  'Total_wt_4',
  'Glass_wt_p',
  'Tot_glas_1',
  'Tot_glas_2',
  'Wood_wt__2',
  'Total_wt_5',
  'Glass_wt_1',
  'Tot_glas_3',
  'Tot_glas_4',
];

// some buildings miss attributes, use this color:
const MISSING_ATTRIBUTE_COLOR = 'rgb(100, 100, 100)';

let numMissing = 0;
let numExisting = 0;

function assignBsmStatisticsForBuilding(f, postfix) {
  selectedNumericPropertyKeys.forEach(a => {
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

// todo: each aggregator must have a specific colorRange, in the old version we did a dynamic color between green and red, but now the universeum ranges should be used
function assignBsmStatisticsForDistrict(f) {
  selectedNumericPropertyKeys.forEach(a => {
    if (
      f.properties.area && // area comes from the district aggregation features
      (f.properties[a] || f.properties[a] === 0) // the value must be aggregated (summed) first from buildings inside
    ) {
      // ! here the heatedFloorArea is used, but it should be the area of the district -> color ranges needs to be defined
      const valuePerDistrictArea =
        f.properties[a] / f.properties.heatedFloorArea;
      // const valuePerDistrictArea = f.properties[a] / f.properties.area;
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

export function addCircularityDataToFeatures(
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

export function prepareCircularityData(): FeatureCollection {
  const inputFilePathBuildings = 'original/GBG_Basemap_2018.json';
  const inputFilePathCircularityData = 'circularity/db.json';
  const buildings = JSON.parse(
    fs.readFileSync(resolve('../../data/', inputFilePathBuildings), 'utf8')
  );
  const data = JSON.parse(
    fs.readFileSync(
      resolve('../../data/', inputFilePathCircularityData),
      'utf8'
    )
  );
  // buildings needs an integer id for maplibre
  addProperty(buildings.features, 'id', () => getNewId());

  // todo: find a way to copy data from points to polygons, see if the aggregator can do it

  // todo: assign the statistics and colors for each selectedNumericalPropertyKey

  return buildings;
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

export function prepareAggregatorData(
  featureCollection: FeatureCollection,
  segmentation: string
) {
  console.log(`preparing aggregator data for ${segmentation}`);
  console.log('Mem: ', process.memoryUsage());
  const data = aggregate(
    featureCollection,
    ['heatedFloorArea', ...selectedNumericPropertyKeys],
    {
      segmentation,
    }
  );
  data.features.forEach(f => {
    // dont delete as it can be used in ui
    // for (const indicator of selectedNumericPropertyKeys) {
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
    ['heatedFloorArea', ...selectedNumericPropertyKeys],
    {
      segmentation: 'grid1km',
    }
  );
  grid1km.features.forEach(f => {
    // dont delete as it can be used in ui
    // for (const indicator of selectedNumericPropertyKeys) {
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
    ['heatedFloorArea', ...selectedNumericPropertyKeys],
    {
      segmentation: 'grid250m',
    }
  );
  grid250m.features.forEach(f => {
    // dont delete as it can be used in ui
    // for (const indicator of selectedNumericPropertyKeys) {
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
    ['heatedFloorArea', ...selectedNumericPropertyKeys],
    {
      segmentation: 'grid100m',
    }
  );
  grid100m.features.forEach(f => {
    // dont delete as it can be used in ui
    // for (const indicator of selectedNumericPropertyKeys) {
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
    ['heatedFloorArea', ...selectedNumericPropertyKeys],
    {
      segmentation: 'cityDistricts',
    }
  );
  cityDistricts.features.forEach(f => {
    // dont delete as it can be used in ui
    // for (const indicator of selectedNumericPropertyKeys) {
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
    ['heatedFloorArea', ...selectedNumericPropertyKeys],
    {
      segmentation: 'baseAreas',
    }
  );
  baseAreas.features.forEach(f => {
    // dont delete as it can be used in ui
    // for (const indicator of selectedNumericPropertyKeys) {
    //   delete f.properties[`${indicator}Sum`];
    //   delete f.properties[`${indicator}Count`];
    // }
    f.properties.id = getNewId();
    assignBsmStatisticsForDistrict(f);
  });

  return baseAreas as FeatureCollection;
  //fs.writeFileSync('data/grid1km.geojson', JSON.stringify(grid1km));
}
