import fs from 'fs';
import { resolve } from 'path';
import { saveToFolderStructure } from '../index.js';
import {
  prepareDataBuildings2018,
  prepareDataBuildings2050,
} from './prepare-data.js';

// this file is an example on tile generation for the dte-digital-twin-energy project

export function generateTiles() {
  const data = {
    buildings2018: prepareDataBuildings2018(),
    buildings2050: prepareDataBuildings2050(),
  };

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
  saveToFolderStructure(data, {});
}

// for running in terminal
generateTiles();
