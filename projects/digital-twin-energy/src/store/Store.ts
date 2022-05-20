import { makeObservable, observable, action } from 'mobx';
import { Viewer, ViewerProps } from '@dtcv/viewer';
import { parseCityModel } from '@dtcv/citymodel';

export class Store {
  public isLoading = false;
  public loadingMessage = '';
  public loadingProgress = 0;
  public showLeftMenu = false;
  public viewer: Viewer;
  public constructor(viewer: Viewer) {
    this.viewer = viewer;
    makeObservable(this, {
      setIsLoading: action,
      isLoading: observable,
      loadingProgress: observable,
    });
    this.loadCityModel(
      'http://localhost:9000/files/citymodel/CityModelWithBSMResults.json'
    );
  }

  public async loadCityModel(url: string) {
    this.setIsLoading(true);
    const response = await fetch(url);
    if (response.status !== 200) {
      return console.warn('response status: ', response.status);
    }
    this.addFileData(await response.json(), url);

    this.viewer.render();
    this.setIsLoading(false);
  }

  public setIsLoading(isLoading: boolean, loadingMessage?: string) {
    this.loadingMessage = loadingMessage || '';
    this.isLoading = isLoading;
  }

  public setLoadingProgress(percentage: number) {
    this.loadingProgress = percentage;
  }

  public reset() {
    this.viewer.setSelectedObject(null);
    this.viewer.unload();
  }

  public render() {
    this.viewer.render();
  }

  addFileData(json: any, url: string) {
    // todo: some more sophisticated way of updating found layer data, instead of hardcoding the layer ids
    // (maybe send the result from parser directly to viewer as a default abstracted option, and let the viewer figure out how to map to layers)
    if (json.Buildings) {
      const { buildings, ground, modelMatrix } = parseCityModel(json);
      this.viewer.setLayerProps('buildings-layer-polygons-lod-1', {
        data: buildings,
        modelMatrix,
      });
      this.viewer.setLayerState('buildings-layer-polygons-lod-1', {
        url,
        isLoaded: true,
      });
      this.viewer.setLayerStyle('buildings-layer-polygons-lod-1', {
        color: {
          sufficient: 40000,
          excellent: 20000,
          propertyKey: 'finalEnergy2020',
        },
      });
      this.viewer.setLayerProps('ground-layer-surface-mesh', {
        data: ground,
        modelMatrix,
      });
      this.viewer.setLayerState('ground-layer-surface-mesh', {
        url,
        isLoaded: true,
      });
    }
  }
}
