import { makeObservable, observable, action } from 'mobx';
import { Viewer, ViewerProps } from '@dtcv/viewer';
import { parseCityModel } from '@dtcv/citymodel';
import { parseCityGml, CityGmlParserOptions } from '@dtcv/citygml';
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

    this.loadCityGmlExample(
      'http://localhost:9000/files/citygml/3CIM/testdata_3CIM_ver1_malmo_20220205_XSD.gml'
    );
  }

  public async loadCityGmlExample(url: string) {
    this.setIsLoading(true, 'Loading file');
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
      console.log(data, modelMatrix);

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
