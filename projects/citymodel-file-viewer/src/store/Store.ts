import { makeObservable, observable, action } from 'mobx';
import { Viewer, ViewerProps } from '@dtcv/viewer';
import { parseCityModel } from '@dtcv/citymodel';

// just testing app state here temporarily with a simple counter
export class Store {
  public isLoading = false;
  public showLeftMenu = false;
  public viewer: Viewer;
  public constructor(viewer: Viewer) {
    this.viewer = viewer;
    makeObservable(this, {
      setIsLoading: action,
      isLoading: observable,
    });
  }
  public exampleFiles = [
    {
      url: 'https://digitaltwincityviewer.s3.eu-north-1.amazonaws.com/Helsingborg2021.json',
      text: 'Helsingborg',
    },
  ];

  public async loadExampleFile(fileIndex: number) {
    await this.loadFile(this.exampleFiles[fileIndex].url);
  }

  public setIsLoading(isLoading: boolean) {
    this.isLoading = isLoading;
  }

  async loadFile(url: string) {
    this.setIsLoading(true);
    const response = await fetch(url);
    // ! what about non-json based files? Should check the file ending
    const json = await response.json();
    if (json.Buildings) {
      const { buildings, ground, modelMatrix } = parseCityModel(json);
      this.viewer.setLayerProps(
        'buildings-layer-polygons-lod-1',
        {
          data: buildings,
          modelMatrix,
        },
        {
          url,
          isLoaded: true,
        }
      );
      this.viewer.setLayerProps(
        'ground-layer-surface-mesh',
        {
          data: ground,
          modelMatrix,
        },
        {
          url,
          isLoaded: true,
        }
      );
    }
    this.setIsLoading(false);
    this.viewer.render();
  }
}
