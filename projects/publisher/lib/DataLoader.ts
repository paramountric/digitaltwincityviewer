import g from 'glob';
import {promisify} from 'util';
import {selectLoader, load} from '@loaders.gl/core';
import {_GeoJSONLoader} from '@loaders.gl/json';
import {ShapefileLoader} from '@loaders.gl/shapefile';

const glob = promisify ? promisify(g) : null;
export class DataLoader {
  constructor() {}

  async getFiles() {
    const files = await glob('public/data/**/*');
    return files.map(f => f.replace('public/', ''));
  }

  async getLoader(fileName: string) {
    try {
      return await selectLoader(fileName, [_GeoJSONLoader, ShapefileLoader]);
    } catch (e) {
      console.log(e);
      return null;
    }
  }

  async load(loader: any, fileName: string) {
    const data = await load(fileName, loader);
    return data;
  }
}
