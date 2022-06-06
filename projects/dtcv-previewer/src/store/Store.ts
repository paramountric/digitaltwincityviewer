import { makeObservable, observable, action } from 'mobx';
import { Viewer, ViewerProps } from '@dtcv/viewer';
import { toGeoJson } from '@dtcv/osm';
import {
  buildingsFromPolygons,
  getModelMatrix,
  coordinatesToMeters,
} from '@dtcv/geojson';

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

    const url = 'http://localhost:9000/files/osm/OSM-malmo/osm-malmo.osm';

    this.loadTestData(url);
  }

  public async loadTestData(url: string) {
    this.setIsLoading(true, 'Loading test data');
    const response = await fetch(url);
    if (response.status !== 200) {
      return console.warn('response status: ', response.status);
    }
    const parser = new DOMParser();
    const doc = parser.parseFromString(
      await response.text(),
      'application/xml'
    );
    const geojson = toGeoJson(doc);
    this.addData(geojson.features, url);
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

  addFileData(data, url) {
    // todo: what support for file upload should the previewer have?
  }

  addData(features: any, url: string) {
    coordinatesToMeters(features);
    const modelMatrix = getModelMatrix(features);
    this.viewer.updateLayer({
      layerId: 'import-geojson',
      props: {
        data: features,
        modelMatrix,
      },
      state: {
        url,
        isLoaded: true,
      },
    });
    this.viewer.render();
  }
}
