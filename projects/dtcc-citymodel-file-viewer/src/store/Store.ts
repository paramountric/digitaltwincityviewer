import { makeObservable, observable, action } from 'mobx';
import * as protobuf from 'protobufjs';
import { Viewer, JsonProps } from '@dtcv/viewer';
import { parseCityModel } from '@dtcv/citymodel';
import { City } from '@dtcv/cities';

export class Store {
  public isLoading = false;
  public showLeftMenu = false;
  public viewer: Viewer;
  private protoRoot: any;
  public constructor(viewer: Viewer) {
    this.viewer = viewer;
    makeObservable(this, {
      setIsLoading: action,
      isLoading: observable,
    });
    this.initPb();
  }

  private async initPb() {
    const protoRoot = await protobuf.load(
      'https://digitaltwincityviewer.s3.eu-north-1.amazonaws.com/dtcc.proto'
    );
    this.protoRoot = protoRoot;
  }

  public setIsLoading(isLoading: boolean) {
    this.isLoading = isLoading;
  }

  public reset() {
    this.viewer.setSelectedObject(null);
    this.viewer.unload();
  }

  public setCity(city: City) {
    this.viewer.setCity(city);
    // todo: check if city has changed, and remove layers from state if so
  }

  // public render() {
  //   this.viewer.render();
  // }

  addPbData(pbData: Uint8Array, pbType: string, city: City) {
    // const data = await addCodeSprintData(
    //   'http://localhost:9000/files/HelsingborgOceanen/CityModel.pb',
    //   'CityModel'
    // );
    // offset: {"y": 6211000.0, "x": 99000.0}

    const typeData = this.protoRoot.lookupType(pbType);
    const decoded = typeData.decode(pbData);
    const decodedJson = decoded.toJSON();
    console.log('decoded', decodedJson);
    // decodedJson.origin = decodedJson.origin ||
    //   decodedJson.Origin || { y: 6211000.0, x: 99000.0 };
    const parsed = parseCityModel(decodedJson, 'EPSG:3006');
    // , pbType, [
    //   city.x,
    //   city.y,
    // ]);
    console.log('parsed', parsed);

    let data;
    let modelMatrix;
    let layerType;

    switch (pbType) {
      case 'CityModel':
        data = parsed.buildings.data;
        modelMatrix = parsed.buildings.modelMatrix;
        layerType = 'CityModelLayer';
        break;
      case 'Surface3D':
        data = parsed.ground.data;
        modelMatrix = parsed.ground.modelMatrix;
        layerType = 'GroundSurfaceLayer';
        break;
      default:
        data = [];
        modelMatrix = null;
    }

    // todo: move to state
    this.viewer.setJson({
      layers: [
        {
          '@@type': layerType,
          id: pbType, // todo: how to support several layers of same type?
          data,
          modelMatrix,
          coordinateOrigin: [0, 0], //[city.lng, city.lat],
        },
      ],
    });
    //cache.set(url, parsed);
    //};
  }

  render() {
    if (!this.viewer) {
      return;
    }
    // const jsonData: JsonProps = {
    //   views: [
    //     {
    //       '@@type': 'MapView',
    //       controller: true,
    //     },
    //   ],
    //   layers: [],
    // };
    // const isBaseMap2050 = baseMapData?.features?.length > 0;

    // const features = contextData?.features || [];
    // const pointFeatures = features.filter(f => f.geometry.type === 'Point');

    // for (const pointFeature of pointFeatures) {
    //   // @ts-ignore
    //   pointFeature.geometry.coordinates[2] = 0;
    // }

    // if (contextData && jsonData && jsonData.layers) {
    //   jsonData.layers.push({
    //     id: 'context-layer',
    //     //'@@type': 'SolidPolygonLayer',
    //     '@@type': 'GeoJsonLayer',
    //     data: contextData,
    //     onClick: (d: any) => {
    //       //
    //     },
    //     //modelMatrix: [],
    //     opacity: 1,
    //     autoHighlight: false,
    //     highlightColor: [100, 150, 250, 255],
    //     extruded: false,
    //     wireframe: false,
    //     pickable: false,
    //     isClickable: false,
    //     coordinateSystem: '@@#COORDINATE_SYSTEM.METER_OFFSETS',
    //     coordinateOrigin: [gothenburg.lng, gothenburg.lat],
    //     getPolygon: '@@=geometry.coordinates',
    //     //getFillColor: '@@=properties.color || [100, 150, 250, 30]',
    //     getFillColor: (feature: Feature) => {
    //       const defaultFillColor = [200, 200, 200, 255];
    //       if (!feature.properties) {
    //         return defaultFillColor;
    //       }
    //       const fillColor = feature.properties?.fillColor;
    //       if (fillColor) {
    //         // todo: have to check the color coding
    //         //return fillColor;
    //       }
    //       // hacky checks for properties in project data
    //       if (feature.properties.DETALJTYP === 'VATTEN') {
    //         return [100, 150, 250, 105];
    //       } else if (feature.properties.SW_MEMBER) {
    //         return [220, 220, 220, 255];
    //       } else if (feature.geometry.type === 'Point') {
    //         return [50, 100, 50, 55];
    //       }
    //     },
    //     getLineColor: (feature: Feature) => {
    //       const defaultFillColor = [200, 200, 200, 255];
    //       if (!feature.properties) {
    //         return defaultFillColor;
    //       }
    //       const fillColor = feature.properties?.fillColor;
    //       if (fillColor) {
    //         // todo: have to check the color coding
    //         //return fillColor;
    //       }
    //       // hacky checks for properties in project data
    //       if (feature.properties.DETALJTYP === 'VATTEN') {
    //         return [100, 150, 250, 50];
    //       } else if (feature.properties.SW_MEMBER) {
    //         return [190, 190, 190, 255];
    //       } else if (feature.geometry.type === 'Point') {
    //         return [50, 100, 50, 50];
    //       }
    //     },
    //     getElevation: 0, //'@@=properties.height || 0',
    //     useDevicePixels: true,
    //     stroked: true,
    //     filled: true,
    //     pointType: 'circle',
    //     lineWidthScale: 1,
    //     lineWidthMinPixels: 1,
    //     getPointRadius: 7,
    //     getLineWidth: 1,
    //     parameters: {
    //       depthMask: true,
    //       depthTest: true,
    //       blend: true,
    //       blendFunc: [
    //         '@@#GL.SRC_ALPHA',
    //         '@@#GL.ONE_MINUS_SRC_ALPHA',
    //         '@@#GL.ONE',
    //         '@@#GL.ONE_MINUS_SRC_ALPHA',
    //       ],
    //       polygonOffsetFill: true,
    //       depthFunc: '@@#GL.LEQUAL',
    //       blendEquation: '@@#GL.FUNC_ADD',
    //     },
    //   });
    // } else if (jsonData && jsonData.layers) {
    //   // jsonData.layers.push({
    //   //   id: 'context-layer',
    //   //   //'@@type': 'SolidPolygonLayer',
    //   //   '@@type': 'GeoJsonLayer',
    //   //   data: {},
    //   //   parameters: {
    //   //     depthMask: true,
    //   //     depthTest: true,
    //   //     blend: true,
    //   //     blendFunc: [
    //   //       '@@#GL.SRC_ALPHA',
    //   //       '@@#GL.ONE_MINUS_SRC_ALPHA',
    //   //       '@@#GL.ONE',
    //   //       '@@#GL.ONE_MINUS_SRC_ALPHA',
    //   //     ],
    //   //     polygonOffsetFill: true,
    //   //     depthFunc: '@@#GL.LEQUAL',
    //   //     blendEquation: '@@#GL.FUNC_ADD',
    //   //   },
    //   // });
    // }

    // if (!isBaseMap2050 && climateScenarioData && jsonData && jsonData.layers) {
    //   jsonData.layers.push({
    //     id: 'bsm-layer',
    //     '@@type': 'SolidPolygonLayer',
    //     //'@@type': 'GeoJsonLayer',
    //     data: climateScenarioData.buildings,
    //     onClick: (d: any) => {
    //       if (d.object) {
    //         if (!d.object.id) {
    //           d.object.id = d.object.properties.uuid;
    //         }
    //         actions.setFeatureId(d.object.id);
    //         return;
    //       }
    //     },
    //     //modelMatrix: data.modelMatrix,
    //     opacity: 1,
    //     autoHighlight: true,
    //     highlightColor: [100, 150, 250, 255],
    //     extruded: true,
    //     wireframe: true,
    //     pickable: true,
    //     isClickable: true,
    //     coordinateSystem: '@@#COORDINATE_SYSTEM.METER_OFFSETS',
    //     coordinateOrigin: [gothenburg.lng, gothenburg.lat],
    //     getPolygon: '@@=geometry.coordinates',
    //     getFillColor: '@@=properties.color || [255, 255, 255, 255]',
    //     getLineColor: [100, 100, 100],
    //     getElevation: '@@=properties.height || 0',
    //     useDevicePixels: true,
    //     parameters: {
    //       depthMask: true,
    //       depthTest: true,
    //       blend: true,
    //       blendFunc: [
    //         '@@#GL.SRC_ALPHA',
    //         '@@#GL.ONE_MINUS_SRC_ALPHA',
    //         '@@#GL.ONE',
    //         '@@#GL.ONE_MINUS_SRC_ALPHA',
    //       ],
    //       polygonOffsetFill: true,
    //       depthFunc: '@@#GL.LEQUAL',
    //       blendEquation: '@@#GL.FUNC_ADD',
    //     },
    //   });
    // }

    // if (baseMapData && jsonData && jsonData.layers) {
    //   jsonData.layers.push({
    //     id: 'baseMap-layer',
    //     //'@@type': 'SolidPolygonLayer',
    //     '@@type': 'GeoJsonLayer',
    //     data: baseMapData,
    //     // onClick: (d: any) => {
    //     //   if (d.object) {
    //     //     if (!d.object.id) {
    //     //       d.object.id = d.object.properties.uuid;
    //     //     }
    //     //     actions.setFeatureId(d.object.id);
    //     //     return;
    //     //   }
    //     // },
    //     //modelMatrix: data.modelMatrix,
    //     opacity: 0.9,
    //     autoHighlight: false,
    //     highlightColor: [100, 150, 250, 255],
    //     extruded: true,
    //     wireframe: false,
    //     pickable: false,
    //     isClickable: false,
    //     coordinateSystem: '@@#COORDINATE_SYSTEM.METER_OFFSETS',
    //     coordinateOrigin: [gothenburg.lng, gothenburg.lat],
    //     getPolygon: '@@=geometry.coordinates',
    //     getFillColor: '@@=properties.color || [255, 255, 255, 255]',
    //     getLineColor: [100, 100, 100, 255],
    //     getElevation: '@@=properties.height || 20',
    //     useDevicePixels: true,
    //     parameters: {
    //       depthMask: true,
    //       depthTest: true,
    //       blend: true,
    //       blendFunc: [
    //         '@@#GL.SRC_ALPHA',
    //         '@@#GL.ONE_MINUS_SRC_ALPHA',
    //         '@@#GL.ONE',
    //         '@@#GL.ONE_MINUS_SRC_ALPHA',
    //       ],
    //       polygonOffsetFill: true,
    //       depthFunc: '@@#GL.LEQUAL',
    //       blendEquation: '@@#GL.FUNC_ADD',
    //     },
    //   });
    // }
    //this.viewer.setJson(jsonData);
  }

  // addFileData(json: any, url: string) {
  //   // todo: some more sophisticated way of updating found layer data, instead of hardcoding the layer ids
  //   // (maybe send the result from parser directly to viewer as a default abstracted option, and let the viewer figure out how to map to layers)
  //   if (json.Buildings) {
  //     const { buildings, ground } = parseCityModel(json);
  //     this.viewer.updateLayer({
  //       layerId: 'buildings-layer-polygons-lod-1',
  //       props: {
  //         data: buildings,
  //       },
  //       state: {
  //         url,
  //       },
  //     });
  //     this.viewer.setLayerProps('ground-layer-surface-mesh', {
  //       data: ground,
  //     });
  //     this.viewer.setLayerState('ground-layer-surface-mesh', {
  //       url,
  //       isLoaded: true,
  //     });
  //   }
  // }
}
