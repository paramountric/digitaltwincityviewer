import fs from 'fs';
import { resolve } from 'path';
import { saveToFolderStructure } from '../index.js';

// this file is an example on tile generation for the dte-digital-twin-energy project

export function generateTiles() {
  const data = {
    buildings2018: JSON.parse(
      fs.readFileSync(
        resolve('../../data/prepared/buildings_2018.json'),
        'utf8'
      )
    ),
    buildings2050: JSON.parse(
      fs.readFileSync(
        resolve('../../data/prepared/buildings_2050.json'),
        'utf8'
      )
    ),
  };
  saveToFolderStructure(data, {});
}

// for running in terminal
generateTiles();
