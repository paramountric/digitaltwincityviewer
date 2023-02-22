import { Feature, FeatureCollection } from 'geojson';
//import pkg from 'reproject';
import { createWriteStream } from 'fs';
import { stringify } from 'big-json';
import { saveToFolderStructure } from '../index.js';
import {
  prepareDataBuildings2018,
  prepareDataBuildings2050,
  prepareWater,
  prepareRoads,
  prepareTrees,
  prepareGrid1Km,
} from './prepare-data.js';

function shortenPropertyNames(featureCollection: FeatureCollection) {
  const propertyNameDict = {
    min_building_height: 'hgt',
    address: 'addr',
    postPlace: 'ppl',
    postCode: 'pco',
    heatedFloorArea: 'hfa',
    building_purpose: 'bp',
    building_purpose_sub_type: 'bps',
    coolingDemand2018_climate_2_5: 'cd18_25',
    coolingDemand2050_climate_2_5: 'cd50_25',
    coolingDemand2018_climate_2_5BuildingAreaNorm: 'cd18_25_ban',
    coolingDemand2050_climate_2_5BuildingAreaNorm: 'cd50_25_ban',
    coolingDemand2018_climate_4_5: 'cd18_45',
    coolingDemand2050_climate_4_5: 'cd50_45',
    coolingDemand2018_climate_4_5BuildingAreaNorm: 'cd18_45_ban',
    coolingDemand2050_climate_4_5BuildingAreaNorm: 'cd50_45_ban',
    coolingDemand2018_climate_8_5: 'cd18_85',
    coolingDemand2050_climate_8_5: 'cd50_85',
    coolingDemand2018_climate_8_5BuildingAreaNorm: 'cd18_85_ban',
    coolingDemand2050_climate_8_5BuildingAreaNorm: 'cd50_85_ban',
    finalEnergy2018_climate_2_5BuildingAreaColor: 'fe18_25_bcol',
    finalEnergy2030_climate_2_5BuildingAreaColor: 'fe30_25_bcol',
    finalEnergy2050_climate_2_5BuildingAreaColor: 'fe50_25_bcol',
    deliveredEnergy2018_climate_2_5BuildingAreaColor: 'de18_25_bcol',
    deliveredEnergy2030_climate_2_5BuildingAreaColor: 'de30_25_bcol',
    deliveredEnergy2050_climate_2_5BuildingAreaColor: 'de50_25_bcol',
    primaryEnergy2018_climate_2_5BuildingAreaColor: 'pe18_25_bcol',
    primaryEnergy2050_climate_2_5BuildingAreaColor: 'pe30_25_bcol',
    primaryEnergy2030_climate_2_5BuildingAreaColor: 'pe50_25_bcol',
    ghgEmissions2018_climate_2_5BuildingAreaColor: 'ge18_25_bcol',
    ghgEmissions2030_climate_2_5BuildingAreaColor: 'ge30_25_bcol',
    ghgEmissions2050_climate_2_5BuildingAreaColor: 'ge50_25_bcol',
    heatDemand2018_climate_2_5BuildingAreaColor: 'hd18_25_bcol',
    heatDemand2030_climate_2_5BuildingAreaColor: 'hd30_25_bcol',
    heatDemand2050_climate_2_5BuildingAreaColor: 'hd50_25_bcol',
    coolingDemand2018_climate_2_5BuildingAreaColor: 'cd18_25_bcol',
    coolingDemand2030_climate_2_5BuildingAreaColor: 'cd30_25_bcol',
    coolingDemand2050_climate_2_5BuildingAreaColor: 'cd50_25_bcol',
    finalEnergy2018_climate_4_5BuildingAreaColor: 'fe18_45_bcol',
    finalEnergy2030_climate_4_5BuildingAreaColor: 'fe30_45_bcol',
    finalEnergy2050_climate_4_5BuildingAreaColor: 'fe50_45_bcol',
    deliveredEnergy2018_climate_4_5BuildingAreaColor: 'de18_45_bcol',
    deliveredEnergy2030_climate_4_5BuildingAreaColor: 'de30_45_bcol',
    deliveredEnergy2050_climate_4_5BuildingAreaColor: 'de50_45_bcol',
    primaryEnergy2018_climate_4_5BuildingAreaColor: 'pe18_45_bcol',
    primaryEnergy2030_climate_4_5BuildingAreaColor: 'pe30_45_bcol',
    primaryEnergy2050_climate_4_5BuildingAreaColor: 'pe50_45_bcol',
    ghgEmissions2018_climate_4_5BuildingAreaColor: 'ge18_45_bcol',
    ghgEmissions2030_climate_4_5BuildingAreaColor: 'ge30_45_bcol',
    ghgEmissions2050_climate_4_5BuildingAreaColor: 'ge50_45_bcol',
    heatDemand2018_climate_4_5BuildingAreaColor: 'hd18_45_bcol',
    heatDemand2030_climate_4_5BuildingAreaColor: 'hd30_45_bcol',
    heatDemand2050_climate_4_5BuildingAreaColor: 'hd50_45_bcol',
    coolingDemand2018_climate_4_5BuildingAreaColor: 'cd18_45_bcol',
    coolingDemand2030_climate_4_5BuildingAreaColor: 'cd30_45_bcol',
    coolingDemand2050_climate_4_5BuildingAreaColor: 'cd50_45_bcol',
    finalEnergy2018_climate_8_5BuildingAreaColor: 'fe18_85_bcol',
    finalEnergy2030_climate_8_5BuildingAreaColor: 'fe30_85_bcol',
    finalEnergy2050_climate_8_5BuildingAreaColor: 'fe50_85_bcol',
    deliveredEnergy2018_climate_8_5BuildingAreaColor: 'de18_85_bcol',
    deliveredEnergy2030_climate_8_5BuildingAreaColor: 'de30_85_bcol',
    deliveredEnergy2050_climate_8_5BuildingAreaColor: 'de50_85_bcol',
    primaryEnergy2018_climate_8_5BuildingAreaColor: 'pe18_85_bcol',
    primaryEnergy2030_climate_8_5BuildingAreaColor: 'pe30_85_bcol',
    primaryEnergy2050_climate_8_5BuildingAreaColor: 'pe50_85_bcol',
    ghgEmissions2018_climate_8_5BuildingAreaColor: 'ge18_85_bcol',
    ghgEmissions2030_climate_8_5BuildingAreaColor: 'ge30_85_bcol',
    ghgEmissions2050_climate_8_5BuildingAreaColor: 'ge50_85_bcol',
    heatDemand2018_climate_8_5BuildingAreaColor: 'hd18_85_bcol',
    heatDemand2030_climate_8_5BuildingAreaColor: 'hd30_85_bcol',
    heatDemand2050_climate_8_5BuildingAreaColor: 'hd50_85_bcol',
    coolingDemand2018_climate_8_5BuildingAreaColor: 'cd18_85_bcol',
    coolingDemand2030_climate_8_5BuildingAreaColor: 'cd30_85_bcol',
    coolingDemand2050_climate_8_5BuildingAreaColor: 'cd50_85_bcol',
    finalEnergy2018_climate_2_5: 'fe18_25',
    finalEnergy2050_climate_2_5: 'fe50_25',
    deliveredEnergy2018_climate_2_5: 'de18_25',
    deliveredEnergy2050_climate_2_5: 'de50_25',
    primaryEnergy2018_climate_2_5: 'pe18_25',
    primaryEnergy2050_climate_2_5: 'pe50_25',
    ghgEmissions2018_climate_2_5: 'ge18_25',
    ghgEmissions2050_climate_2_5: 'ge50_25',
    heatDemand2018_climate_2_5: 'hd18_15',
    heatDemand2050_climate_2_5: 'hd50_25',
    finalEnergy2018_climate_4_5: 'fe18_45',
    finalEnergy2050_climate_4_5: 'fe50_45',
    deliveredEnergy2018_climate_4_5: 'de18_45',
    deliveredEnergy2050_climate_4_5: 'de50_45',
    primaryEnergy2018_climate_4_5: 'pe18_45',
    primaryEnergy2050_climate_4_5: 'pe50_45',
    ghgEmissions2018_climate_4_5: 'ge18_45',
    ghgEmissions2050_climate_4_5: 'ge50_45',
    heatDemand2018_climate_4_5: 'hd18_45',
    heatDemand2050_climate_4_5: 'hd50_45',
    finalEnergy2018_climate_8_5: 'fe18_85',
    finalEnergy2050_climate_8_5: 'fe50_85',
    deliveredEnergy2018_climate_8_5: 'de18_85',
    deliveredEnergy2050_climate_8_5: 'de50_85',
    primaryEnergy2018_climate_8_5: 'pe18_85',
    primaryEnergy2050_climate_8_5: 'pe50_85',
    ghgEmissions2018_climate_8_5: 'ge18_85',
    ghgEmissions2050_climate_8_5: 'ge50_85',
    heatDemand2018_climate_8_5: 'hd18_85',
    heatDemand2050_climate_8_5: 'hd50_85',
    finalEnergy2018_climate_2_5BuildingAreaNorm: 'fe18_25_ban',
    finalEnergy2050_climate_2_5BuildingAreaNorm: 'fe50_25_ban',
    deliveredEnergy2018_climate_2_5BuildingAreaNorm: 'de18_25_ban',
    deliveredEnergy2050_climate_2_5BuildingAreaNorm: 'de50_25_ban',
    primaryEnergy2018_climate_2_5BuildingAreaNorm: 'pe18_25_ban',
    primaryEnergy2050_climate_2_5BuildingAreaNorm: 'pe50_25_ban',
    ghgEmissions2018_climate_2_5BuildingAreaNorm: 'ge18_25_ban',
    ghgEmissions2050_climate_2_5BuildingAreaNorm: 'ge50_25_ban',
    heatDemand2018_climate_2_5BuildingAreaNorm: 'hd18_25_ban',
    heatDemand2050_climate_2_5BuildingAreaNorm: 'hd50_25_ban',
    finalEnergy2018_climate_4_5BuildingAreaNorm: 'fe18_45_ban',
    finalEnergy2050_climate_4_5BuildingAreaNorm: 'fe50_45_ban',
    deliveredEnergy2018_climate_4_5BuildingAreaNorm: 'de18_45_ban',
    deliveredEnergy2050_climate_4_5BuildingAreaNorm: 'de50_45_ban',
    primaryEnergy2018_climate_4_5BuildingAreaNorm: 'pe18_45_ban',
    primaryEnergy2050_climate_4_5BuildingAreaNorm: 'pe50_45_ban',
    ghgEmissions2018_climate_4_5BuildingAreaNorm: 'ge18_45_ban',
    ghgEmissions2050_climate_4_5BuildingAreaNorm: 'ge50_45_ban',
    heatDemand2018_climate_4_5BuildingAreaNorm: 'hd18_45_ban',
    heatDemand2050_climate_4_5BuildingAreaNorm: 'hd50_45_ban',
    finalEnergy2018_climate_8_5BuildingAreaNorm: 'fe18_85_ban',
    finalEnergy2050_climate_8_5BuildingAreaNorm: 'fe50_85_ban',
    deliveredEnergy2018_climate_8_5BuildingAreaNorm: 'de18_85_ban',
    deliveredEnergy2050_climate_8_5BuildingAreaNorm: 'de50_85_ban',
    primaryEnergy2018_climate_8_5BuildingAreaNorm: 'pe18_85_ban',
    primaryEnergy2050_climate_8_5BuildingAreaNorm: 'pe50_85_ban',
    ghgEmissions2018_climate_8_5BuildingAreaNorm: 'ge18_85_ban',
    ghgEmissions2050_climate_8_5BuildingAreaNorm: 'ge50_85_ban',
    heatDemand2018_climate_8_5BuildingAreaNorm: 'hd18_85_ban',
    heatDemand2050_climate_8_5BuildingAreaNorm: 'hd50_85_ban',
  };
  const newFeatures = [];
  for (const feature of featureCollection.features) {
    const newProperties = Object.assign({}, feature.properties);
    for (const propertyKey of Object.keys(feature.properties)) {
      if (propertyNameDict[propertyKey]) {
        newProperties[propertyNameDict[propertyKey]] =
          newProperties[propertyKey];
        delete newProperties[propertyKey];
      }
    }
    newFeatures.push({
      type: feature.type,
      geometry: feature.geometry,
      properties: newProperties,
    });
  }
  const newFeatureCollection = Object.assign({}, featureCollection, {
    features: newFeatures,
  });
  return newFeatureCollection;
}

// this file is an example on tile generation for the dte-digital-twin-energy project

export async function generateTiles() {
  const buildings2018 = prepareDataBuildings2018();
  const buildings2050 = prepareDataBuildings2050();
  const grid1Km2018 = prepareGrid1Km(buildings2018);
  const grid1Km2050 = prepareGrid1Km(buildings2050);
  //const featureTable = {};

  const data = {
    buildings2018: shortenPropertyNames(buildings2018),
    buildings2050: shortenPropertyNames(buildings2050),
    grid1Km2018: shortenPropertyNames(grid1Km2018),
    grid1Km2050: shortenPropertyNames(grid1Km2050),
    water: prepareWater(),
    roads: prepareRoads(),
    trees: prepareTrees(),
  };

  // const wstr = createWriteStream('feature-table.json');
  // wstr.write(await stringify({ body: featureTable }), err => {
  //   if (err) {
  //     console.error(err);
  //   } else {
  //     console.log('feature table written');
  //   }
  // });
  // ! reading to file has a problem (see prepare-data.ts), instead do everything in one go
  // const data = {
  //   buildings2018: JSON.parse(
  //     fs.readFileSync(
  //       resolve('../../data/prepared/buildings_2018.json'),
  //       'utf8'
  //     )
  //   ),
  //   buildings2050: JSON.parse(
  //     fs.readFileSync(
  //       resolve('../../data/prepared/buildings_2050.json'),
  //       'utf8'
  //     )
  //   ),
  // };
  saveToFolderStructure(data, {
    minZoom: 8,
    maxZoom: 10,
  });
}

// for running in terminal
generateTiles();
