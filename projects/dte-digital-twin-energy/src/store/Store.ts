import { makeObservable, observable, action, reaction } from 'mobx';
import { Viewer, ViewerProps } from '@dtcv/viewer';
import { parseCityModel } from '@dtcv/citymodel';

function generateTimelineData(objects, propertyKey) {
  const timeResolution = 12;
  if (objects.length === 0) {
    return {
      total: Array(timeResolution).fill(0),
      perM2: Array(timeResolution).fill(0),
    };
  }
  const monthlyPropertyKey = `monthly${propertyKey
    .charAt(0)
    .toUpperCase()}${propertyKey.slice(1)}`;
  const sum = objects.reduce(
    (acc, o) => {
      const building = o.object;
      for (let i = 0; i < timeResolution; i++) {
        const propertyValue = building.properties[monthlyPropertyKey][i] || 0;
        const floorArea = building.properties.heatedFloorArea || 0;
        acc[monthlyPropertyKey][i] += propertyValue;
        acc.floorArea[i] += floorArea;
      }
      return acc;
    },
    {
      [monthlyPropertyKey]: Array(timeResolution).fill(0),
      floorArea: Array(timeResolution).fill(0),
    }
  );
  return {
    total: sum[monthlyPropertyKey],
    perM2: sum[monthlyPropertyKey].map((val, i) => val / sum.floorArea[i]),
  };
}

const propertyKeyOptions = ['finalEnergy', 'heatDemand'];
const yearOptions = ['2020', '2030', '2050'];
export class Store {
  public isLoading = false;
  public loadingMessage = '';
  public loadingProgress = 0;
  public showLeftMenu = false;
  public viewer: Viewer;
  public selectedPropertyKey: string = 'finalEnergy';
  public selectedYear: string = '2020';
  public showTimelinePerM2 = false; // show total by default
  public timelineData: {
    total: number[];
    perM2: number[];
  };
  public constructor(viewer: Viewer) {
    this.viewer = viewer;
    this.timelineData = generateTimelineData([], this.selectedPropertyKey);
    reaction(
      () => viewer.viewStore.viewStateEnd,
      viewState => {
        this.updateTimelineValues();
      }
    );
    reaction(
      () => this.selectedYear,
      () => {
        this.updateBuildingColors();
        this.updateTimelineValues();
      }
    );
    reaction(
      () => this.selectedPropertyKey,
      () => {
        this.updateBuildingColors();
        this.updateTimelineValues();
      }
    );
    makeObservable(this, {
      setIsLoading: action,
      isLoading: observable,
      loadingProgress: observable,
      timelineData: observable,
    });
    this.loadCityModel(
      'http://localhost:9000/files/citymodel/CityModelWithBSMResults.json'
    );
  }

  updateBuildingColors() {
    if (!this.selectedPropertyKey || !this.selectedYear) {
      return;
    }
    this.viewer.setLayerStyle('buildings-layer-polygons-lod-1', {
      color: {
        sufficient: 150,
        excellent: 60,
        propertyKey: `${this.selectedPropertyKey}${this.selectedYear}M2`,
      },
    });
  }

  updateTimelineValues() {
    if (!this.selectedPropertyKey || !this.selectedYear) {
      return;
    }
    const visibleObjects = this.viewer.getVisibleObjects([
      'buildings-layer-polygons-lod-1',
    ]);
    this.timelineData = generateTimelineData(
      visibleObjects,
      `${this.selectedPropertyKey}${this.selectedYear}`
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
      const { buildings, modelMatrix } = parseCityModel(json);
      this.preprocessBuildings(buildings);
      this.viewer.setLayerProps('buildings-layer-polygons-lod-1', {
        data: buildings,
        modelMatrix,
      });
      this.viewer.setLayerState('buildings-layer-polygons-lod-1', {
        url,
        isLoaded: true,
      });
      // no surface atm
      // this.viewer.setLayerProps('ground-layer-surface-mesh', {
      //   data: ground,
      //   modelMatrix,
      // });
      // this.viewer.setLayerState('ground-layer-surface-mesh', {
      //   url,
      //   isLoaded: true,
      // });
      this.updateBuildingColors();
      this.updateTimelineValues();
    }
  }

  // convenience function to fix data while iterating fast in the project, ideally the data is already coming in correctly
  preprocessBuildings(buildings) {
    const propertiyKeysPerM2 = [
      'deliveredEnergy2020',
      'deliveredEnergy2030',
      'deliveredEnergy2050',
      'primaryEnergy2020',
      'primaryEnergy2030',
      'primaryEnergy2050',
      'finalEnergy2020',
      'finalEnergy2030',
      'finalEnergy2050',
      'ghgEmissions2020',
      'ghgEmissions2030',
      'ghgEmissions2050',
      'heatDemand2020',
      'heatDemand2030',
      'heatDemand2050',
    ];
    for (const building of buildings) {
      for (const propertyKey of propertiyKeysPerM2)
        building.properties[`${propertyKey}M2`] =
          building.properties[propertyKey] /
          building.properties.heatedFloorArea;
    }
  }
}
