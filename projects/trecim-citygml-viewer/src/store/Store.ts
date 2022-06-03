import { makeObservable, observable, action } from 'mobx';
import { Viewer, ViewerProps } from '@dtcv/viewer';
import { parseCityModel } from '@dtcv/citymodel';
import { parseXsd, parseCityGml, CityGmlParserOptions } from '@dtcv/citygml';
import {
  buildingsLayerSurfacesLod3Data,
  transportationLayerTrafficAreaLod2Data,
  transportationLayerAuxiliaryTrafficAreaLod2Data,
  landuseSurfaceLod1Data,
} from '@dtcv/cityjson';

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

    this.loadProjectFiles();
  }

  // todo: promisify! also, prebuild the schema files and load from package
  private async loadProjectFiles() {
    this.setIsLoading(true, 'Loading schema');
    const building = await this.loadCityModelSchema(
      'http://localhost:9000/files/xsd/citygml2/building.xsd'
    );
    this.setIsLoading(true, 'Loading extension');
    const extension = await this.loadCityModelSchema(
      'http://localhost:9000/files/citygml/3CIM/3CIM_ade_ver1.xsd'
    );
    await this.loadCityModel(
      'http://localhost:9000/files/citygml/3CIM/testdata_3CIM_ver1_malmo_20220205_XSD.gml'
    );
  }

  public async loadCityModelSchema(url: string) {
    const response = await fetch(url);
    if (response.status !== 200) {
      return console.warn('response status: ', response.status);
    }
    parseXsd(await response.text(), schema => {
      console.log(schema);
    });
  }

  public async loadCityModel(url: string) {
    this.setIsLoading(true, 'Loading test data');
    const response = await fetch(url);
    if (response.status !== 200) {
      return console.warn('response status: ', response.status);
    }
    const options: CityGmlParserOptions = {
      cityObjectMembers: {
        'bldg:Building': true,
        'transportation:TrafficArea': true,
        'transportation:AuxiliaryTrafficArea': true,
        'luse:LandUse': true,
      },
    };
    parseCityGml(await response.text(), options, cityGmlResult => {
      const { data, modelMatrix } = landuseSurfaceLod1Data(cityGmlResult);

      if (options.cityObjectMembers['bldg:Building']) {
        this.viewer.setLayerProps(
          'buildings-layer-surfaces-lod-3',
          buildingsLayerSurfacesLod3Data(cityGmlResult)
        );
        this.viewer.setLayerState('buildings-layer-surfaces-lod-3', {
          url,
          isLoaded: true,
        });
      }
      if (options.cityObjectMembers['transportation:TrafficArea']) {
        this.viewer.setLayerProps(
          'transportation-layer-traffic-area-lod-2',
          transportationLayerTrafficAreaLod2Data(cityGmlResult)
        );
        this.viewer.setLayerState('transportation-layer-traffic-area-lod-2', {
          url,
          isLoaded: true,
        });
      }
      if (options.cityObjectMembers['transportation:AuxiliaryTrafficArea']) {
        this.viewer.setLayerProps(
          'transportation-layer-auxiliary-traffic-area-lod-2',
          transportationLayerAuxiliaryTrafficAreaLod2Data(cityGmlResult)
        );
        this.viewer.setLayerState(
          'transportation-layer-auxiliary-traffic-area-lod-2',
          {
            url,
            isLoaded: true,
          }
        );
      }
      if (options.cityObjectMembers['luse:LandUse']) {
        this.viewer.setLayerProps(
          'landuse-layer-surface-lod-1',
          landuseSurfaceLod1Data(cityGmlResult)
        );
        this.viewer.setLayerState('landuse-layer-surface-lod-1', {
          url,
          isLoaded: true,
        });
      }

      this.viewer.render();
      this.setIsLoading(false);
    });
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
    // todo: move the code from after parser into this function
  }
}
