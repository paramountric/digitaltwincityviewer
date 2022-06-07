import { makeObservable, observable, action } from 'mobx';
import { Viewer, ViewerProps } from '@dtcv/viewer';
import { parseCityModel } from '@dtcv/citymodel';
import { parseXsd, parseCityGml, CityGmlParserOptions } from '@dtcv/citygml';
import {
  buildingsLayerSurfacesLod3Data,
  transportationLayerTrafficAreaLod2Data,
  transportationLayerAuxiliaryTrafficAreaLod2Data,
  landuseSurfaceLod1Data,
  projectVertices,
  projectExtent,
} from '@dtcv/cityjson';
import { getModelMatrix, coordinatesToMeters } from '@dtcv/geojson';

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
    // this.setIsLoading(true, 'Loading schema');
    // const core = await this.loadCityModelSchema(
    //   'http://localhost:9000/files/xsd/citygml2/core.xsd'
    // );
    // const building = await this.loadCityModelSchema(
    //   'http://localhost:9000/files/xsd/citygml2/building.xsd'
    // );
    // this.setIsLoading(true, 'Loading extension');
    // const extension = await this.loadCityModelSchema(
    //   'http://localhost:9000/files/citygml/3CIM/3CIM_ade_ver1.xsd'
    // );
    await this.loadCityModel(
      'http://localhost:9000/files/citygml/3CIM/testdata_3CIM_ver1_malmo_20220205_XSD.gml'
    );

    await this.loadContextMap(
      'http://localhost:9000/files/geojson/osm-malmo.json'
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
      console.log(cityGmlResult);
      cityGmlResult.vertices = projectVertices(cityGmlResult.vertices);
      cityGmlResult.metadata.geographicalExtent = projectExtent(
        cityGmlResult.metadata.geographicalExtent
      );

      // these settings are for playing around with the z level of the layers, the viewer needs to be flexible here so that developers can configure the layers z slightly depending on project
      const buildingsZ = 30;
      const transportationZ = 30;
      const transportationAuxZ = 30;
      const landuseZ = 30;

      if (options.cityObjectMembers['bldg:Building']) {
        this.viewer.updateLayer({
          layerId: 'buildings-layer-surfaces-lod-3',
          props: buildingsLayerSurfacesLod3Data(cityGmlResult, buildingsZ),
          state: {
            url,
          },
        });
      }
      if (options.cityObjectMembers['transportation:TrafficArea']) {
        this.viewer.setLayerProps(
          'transportation-layer-traffic-area-lod-2',
          transportationLayerTrafficAreaLod2Data(cityGmlResult, transportationZ)
        );
        this.viewer.setLayerState('transportation-layer-traffic-area-lod-2', {
          url,
          isLoaded: true,
        });
      }
      if (options.cityObjectMembers['transportation:AuxiliaryTrafficArea']) {
        this.viewer.setLayerProps(
          'transportation-layer-auxiliary-traffic-area-lod-2',
          transportationLayerAuxiliaryTrafficAreaLod2Data(
            cityGmlResult,
            transportationAuxZ
          )
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
          landuseSurfaceLod1Data(cityGmlResult, landuseZ)
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

  async loadContextMap(url) {
    this.setIsLoading(true, 'Loading context map');
    const response = await fetch(url);
    if (response.status !== 200) {
      return console.warn('response status: ', response.status);
    }
    const geojson = await response.json();
    const { features } = geojson;
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
    // todo: move the code from after parser into this function
  }
}
