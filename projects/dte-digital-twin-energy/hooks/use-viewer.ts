import {useState, useEffect, useCallback} from 'react';
import {useQuery} from '@tanstack/react-query';
import {Viewer, JsonProps} from '@dtcv/viewer';
import {cities} from '@dtcv/cities';
import {Feature, FeatureCollection} from '@dtcv/geojson';
import {useUserInfo} from './use-user';
import {useSelectedFeature} from './use-selected-feature';
import {getColorFromScale} from '../lib/colorScales';
import {useUi} from './use-ui';

const gothenburg = cities.find((c: any) => c.id === 'gothenburg');
if (!gothenburg || !gothenburg.x) {
  throw new Error('City must be selected on app level');
}

// level 1, 2, 3 and building
const aggregationZoomLevels = [8, 11, 12, 14];

// this will be shown by default on mapload
const initialColorProperty = 'deliveredEnergyBuildingAreaColor';

const TILE_SERVER_URL = 'http://localhost:9000';

const maplibreOptions = {
  longitude: gothenburg.lng,
  // adjust camera since the official center is not the same as the app data
  latitude: gothenburg.lat, //57.7927,
  style: {
    id: 'digitaltwincityviewer',
    aggregationZoomLevels,
    layers: [
      {
        id: 'background',
        type: 'background',
        paint: {
          'background-color': 'rgba(255, 255, 255, 1)',
        },
      },
      {
        id: 'building',
        name: 'Building extruded',
        type: 'fill-extrusion',
        source: 'vectorTiles',
        'source-layer': 'buildings2018',
        maxzoom: 18,
        minzoom: 10, //aggregationZoomLevels[3],
        layout: {
          visibility: 'visible',
        },
        paint: {
          'fill-extrusion-color': ['get', initialColorProperty],
          'fill-extrusion-height': ['get', 'height'],
          'fill-extrusion-base': 0,
          'fill-extrusion-opacity': 0.8,
        },
      },
    ],
    sources: {
      vectorTiles: {
        type: 'vector',
        promoteId: 'id',
        tiles: [`${TILE_SERVER_URL}/tiles/{z}/{x}/{y}`],
      },
    },
    version: 8,
  },
};

export const useViewer = (): {
  initViewer: (ref: HTMLElement) => void;
  viewer: Viewer | null;
  viewerLoading: boolean;
  getVisibleFeatures: () => Feature[];
} => {
  const [viewer, setViewer] = useState<Viewer | null>(null);
  const [extent, setExtent] = useState<number[]>([]);

  const userInfo = useUserInfo();
  const {state: uiState} = useUi();
  const {actions} = useSelectedFeature();

  // const queryBuildings2018 = useQuery(
  //   ['buildings-2018'],
  //   async () => {
  //     try {
  //       const res = await fetch('/api/data/buildings2018');
  //       return await res.json();
  //     } catch (err) {
  //       return undefined;
  //     }
  //   },
  //   {
  //     refetchOnWindowFocus: false,
  //     enabled: true,
  //   }
  // );

  // const queryBuildings2050 = useQuery(
  //   ['buildings-2050'],
  //   async () => {
  //     try {
  //       const res = await fetch('/api/data/buildings2050');
  //       return await res.json();
  //     } catch (err) {
  //       return undefined;
  //     }
  //   },
  //   {
  //     refetchOnWindowFocus: false,
  //     enabled: false,
  //   }
  // );

  const contextData = useQuery(
    ['context'],
    async () => {
      try {
        const res = await fetch('/api/data/context');
        return await res.json();
      } catch (err) {
        return undefined;
      }
    },
    {
      refetchOnWindowFocus: false,
      enabled: false,
    }
  );

  // const updateTimeline = () => {
  //   console.log('test', viewer, propertyKey, selectedYear);
  //   if (!viewer || !propertyKey || !selectedYear) {
  //     return;
  //   }
  //   const visibleObjects = ;
  //   const timelineData = getTimelineData(visibleObjects);
  //   console.log(timelineData);
  // };

  const render = () => {
    if (!viewer) {
      return;
    }
    const jsonData: JsonProps = {
      layers: [],
    };
    const isBaseMap2050 = false; //baseMapData?.features?.length > 0;

    const features = contextData.data?.features || [];
    const pointFeatures = features.filter(
      (f: Feature) => f.geometry.type === 'Point'
    );

    for (const pointFeature of pointFeatures) {
      // @ts-ignore
      pointFeature.geometry.coordinates[2] = 0;
    }

    if (contextData && jsonData && jsonData.layers) {
      jsonData.layers.push({
        id: 'context-layer',
        //'@@type': 'SolidPolygonLayer',
        '@@type': 'GeoJsonLayer',
        data: contextData,
        onClick: (d: any) => {
          //
        },
        //modelMatrix: [],
        opacity: 1,
        autoHighlight: false,
        highlightColor: [100, 150, 250, 255],
        extruded: false,
        wireframe: false,
        pickable: false,
        isClickable: false,
        coordinateSystem: '@@#COORDINATE_SYSTEM.METER_OFFSETS',
        coordinateOrigin: [gothenburg.lng, gothenburg.lat],
        getPolygon: '@@=geometry.coordinates',
        //getFillColor: '@@=properties.color || [100, 150, 250, 30]',
        getFillColor: (feature: Feature) => {
          const defaultFillColor = [200, 200, 200, 255];
          if (!feature.properties) {
            return defaultFillColor;
          }
          const fillColor = feature.properties?.fillColor;
          if (fillColor) {
            // todo: have to check the color coding
            //return fillColor;
          }
          // hacky checks for properties in project data
          if (feature.properties.DETALJTYP === 'VATTEN') {
            return [100, 150, 250, 105];
          } else if (feature.properties.SW_MEMBER) {
            return [220, 220, 220, 255];
          } else if (feature.geometry.type === 'Point') {
            return [50, 100, 50, 55];
          }
        },
        getLineColor: (feature: Feature) => {
          const defaultFillColor = [200, 200, 200, 255];
          if (!feature.properties) {
            return defaultFillColor;
          }
          const fillColor = feature.properties?.fillColor;
          if (fillColor) {
            // todo: have to check the color coding
            //return fillColor;
          }
          // hacky checks for properties in project data
          if (feature.properties.DETALJTYP === 'VATTEN') {
            return [100, 150, 250, 50];
          } else if (feature.properties.SW_MEMBER) {
            return [190, 190, 190, 255];
          } else if (feature.geometry.type === 'Point') {
            return [50, 100, 50, 50];
          }
        },
        getElevation: 0, //'@@=properties.height || 0',
        useDevicePixels: true,
        stroked: true,
        filled: true,
        pointType: 'circle',
        lineWidthScale: 1,
        lineWidthMinPixels: 1,
        getPointRadius: 7,
        getLineWidth: 1,
        parameters: {
          depthMask: true,
          depthTest: true,
          blend: true,
          blendFunc: [
            '@@#GL.SRC_ALPHA',
            '@@#GL.ONE_MINUS_SRC_ALPHA',
            '@@#GL.ONE',
            '@@#GL.ONE_MINUS_SRC_ALPHA',
          ],
          polygonOffsetFill: true,
          depthFunc: '@@#GL.LEQUAL',
          blendEquation: '@@#GL.FUNC_ADD',
        },
      });
    } else if (jsonData && jsonData.layers) {
      // jsonData.layers.push({
      //   id: 'context-layer',
      //   //'@@type': 'SolidPolygonLayer',
      //   '@@type': 'GeoJsonLayer',
      //   data: {},
      //   parameters: {
      //     depthMask: true,
      //     depthTest: true,
      //     blend: true,
      //     blendFunc: [
      //       '@@#GL.SRC_ALPHA',
      //       '@@#GL.ONE_MINUS_SRC_ALPHA',
      //       '@@#GL.ONE',
      //       '@@#GL.ONE_MINUS_SRC_ALPHA',
      //     ],
      //     polygonOffsetFill: true,
      //     depthFunc: '@@#GL.LEQUAL',
      //     blendEquation: '@@#GL.FUNC_ADD',
      //   },
      // });
    }

    const climateScenarioData = false;

    if (!isBaseMap2050 && climateScenarioData && jsonData && jsonData.layers) {
      jsonData.layers.push({
        id: 'bsm-layer',
        '@@type': 'SolidPolygonLayer',
        //'@@type': 'GeoJsonLayer',
        //data: climateScenarioData.buildings,
        onClick: (d: any) => {
          if (d.object) {
            if (!d.object.id) {
              d.object.id = d.object.properties.uuid;
            }
            actions.setFeatureId(d.object.id);
            return;
          }
        },
        //modelMatrix: data.modelMatrix,
        opacity: 1,
        autoHighlight: true,
        highlightColor: [100, 150, 250, 255],
        extruded: true,
        wireframe: true,
        pickable: true,
        isClickable: true,
        coordinateSystem: '@@#COORDINATE_SYSTEM.METER_OFFSETS',
        coordinateOrigin: [gothenburg.lng, gothenburg.lat],
        getPolygon: '@@=geometry.coordinates',
        getFillColor: '@@=properties.color || [255, 255, 255, 255]',
        getLineColor: [100, 100, 100],
        getElevation: '@@=properties.height || 0',
        useDevicePixels: true,
        parameters: {
          depthMask: true,
          depthTest: true,
          blend: true,
          blendFunc: [
            '@@#GL.SRC_ALPHA',
            '@@#GL.ONE_MINUS_SRC_ALPHA',
            '@@#GL.ONE',
            '@@#GL.ONE_MINUS_SRC_ALPHA',
          ],
          polygonOffsetFill: true,
          depthFunc: '@@#GL.LEQUAL',
          blendEquation: '@@#GL.FUNC_ADD',
        },
      });
    }

    const baseMapData = false;

    if (baseMapData && jsonData && jsonData.layers) {
      jsonData.layers.push({
        id: 'baseMap-layer',
        //'@@type': 'SolidPolygonLayer',
        '@@type': 'GeoJsonLayer',
        data: baseMapData,
        // onClick: (d: any) => {
        //   if (d.object) {
        //     if (!d.object.id) {
        //       d.object.id = d.object.properties.uuid;
        //     }
        //     actions.setFeatureId(d.object.id);
        //     return;
        //   }
        // },
        //modelMatrix: data.modelMatrix,
        opacity: 0.9,
        autoHighlight: false,
        highlightColor: [100, 150, 250, 255],
        extruded: true,
        wireframe: false,
        pickable: false,
        isClickable: false,
        coordinateSystem: '@@#COORDINATE_SYSTEM.METER_OFFSETS',
        coordinateOrigin: [gothenburg.lng, gothenburg.lat],
        getPolygon: '@@=geometry.coordinates',
        getFillColor: '@@=properties.color || [255, 255, 255, 255]',
        getLineColor: [100, 100, 100, 255],
        getElevation: '@@=properties.height || 20',
        useDevicePixels: true,
        parameters: {
          depthMask: true,
          depthTest: true,
          blend: true,
          blendFunc: [
            '@@#GL.SRC_ALPHA',
            '@@#GL.ONE_MINUS_SRC_ALPHA',
            '@@#GL.ONE',
            '@@#GL.ONE_MINUS_SRC_ALPHA',
          ],
          polygonOffsetFill: true,
          depthFunc: '@@#GL.LEQUAL',
          blendEquation: '@@#GL.FUNC_ADD',
        },
      });
    }
    viewer.setJson(jsonData);
  };

  useEffect(() => {
    render();
  }, [viewer]);

  // useEffect(() => {
  //   const {propertyKey, selectedYear} = indicatorState;
  //   if (
  //     !viewer ||
  //     !climateScenarioData ||
  //     !climateScenarioData.buildings ||
  //     !propertyKey ||
  //     !selectedYear
  //   ) {
  //     return;
  //   }
  //   for (const feature of climateScenarioData.buildings) {
  //     if (!feature.properties) {
  //       continue;
  //     }
  //     const key = `${propertyKey}${selectedYear}M2`;
  //     const val = feature.properties[key];
  //     if (val) {
  //       const scale =
  //         propertyKey === 'ghgEmissions' ? 'buildingGhg' : 'energyDeclaration';
  //       feature.properties.color = getColorFromScale(val, scale);
  //     }
  //   }
  //   // old code for gradient color scale between green and red using generateColor from viewer module
  //   // const colorStyle = {
  //   //   sufficient: 150,
  //   //   excellent: 60,
  //   //   propertyKey: `${propertyKey}${selectedYear}M2`,
  //   // };
  //   // console.log(climateScenarioData);

  //   // for (const feature of climateScenarioData.buildings) {
  //   //   if (
  //   //     feature.properties &&
  //   //     colorStyle.propertyKey &&
  //   //     colorStyle.sufficient &&
  //   //     colorStyle.excellent
  //   //   ) {
  //   //     const color = generateColor(
  //   //       feature.properties[colorStyle.propertyKey],
  //   //       colorStyle.sufficient,
  //   //       colorStyle.excellent
  //   //     );
  //   //     feature.properties.color = color;
  //   //   }
  //   // }
  //   // this should trigger the bottom panel initially (with all data)
  //   // updateTimelineData(propertyKey, selectedYear);
  //   // render();
  // }, [indicatorState, viewer, climateScenarioData]);

  // useEffect(() => {
  //   render();
  // }, [contextData, baseMapData]);

  // useEffect(() => {
  //   refetchClimateScenarioData();
  //   refetchBaseMapData();
  //   refetchContextData();
  // }, [userInfo]);

  // useEffect(() => {
  //   if (viewer) {
  //     const result = viewer.getVisibleObjects(['bsm-layer']);
  //     const features = result.map((r: any) => r.object).filter(Boolean);
  //     const {propertyKey, selectedYear} = indicatorState;
  //     updateTimelineData(propertyKey, selectedYear, features);
  //   }
  // }, [extent]);

  return {
    initViewer: ref => {
      if (viewer) {
        return;
      }
      ref.style.width = '100%'; //window.innerWidth;
      ref.style.height = '100%'; //window.innerHeight;
      ref.style.position = 'absolute';
      ref.style.top = '0px';
      ref.style.left = '0px';
      //ref.style.background = '#100';
      setViewer(
        new Viewer(
          {
            container: ref,
            onDragEnd: ({longitude, latitude, zoom}: any) => {
              setExtent([longitude, latitude, zoom]);
            },
          },
          maplibreOptions
        )
      );
    },
    viewer,
    viewerLoading: false,
    getVisibleFeatures: () => {
      if (viewer) {
        return viewer.getVisibleObjects(['bsm-layer']);
      }
      return [];
    },
  };
};

// ! kept for reference

// useEffect(() => {
//   if (viewer) {
//     const json: any = {
// views: [
//   {
//     '@@type': 'MapView',
//     id: 'mapview',
//     controller: true,
//   },
// ],
// viewState: {
//   mainview: {
//     longitude: 0, //11.9746,
//     latitude: 0, //57.7089,
//     zoom: 14,
//     target: [0, 0, 0],
//     pitch: 60,
//     bearing: 0,
//   },
// },
// layers: [
// {
//   '@@type': 'MVTLayer',
//   //data: 'http://localhost:9000/files/3dtiles/1.1/Batched/BatchedColors/tileset.json',
//   data: 'http://localhost:9000/tiles/{z}/{x}/{y}',
// },
// {
//   '@@type': 'QuadkeyLayer',
//   id: 'quadkeys',
//   data: [
//     {
//       quadkey: viewer.getQuadkey(1, 0, 1),
//       fillColor: [128, 255, 0],
//       elevation: 10,
//     },
//     {
//       quadkey: viewer.getQuadkey(1, 1, 1),
//       fillColor: [255, 128, 255],
//       elevation: 100,
//     },
//     {
//       quadkey: viewer.getQuadkey(0, 1, 1),
//       fillColor: [128, 255, 255],
//       elevation: 10,
//     },
//     {
//       quadkey: viewer.getQuadkey(0, 0, 1),
//       fillColor: [255, 0, 255],
//       elevation: 100,
//     },
//   ],
//   coordinateSystem: '@@#COORDINATE_SYSTEM.METER_OFFSETS',
//   pickable: false,
//   wireframe: true,
//   stroked: true,
//   filled: true,
//   extruded: true,
//   elevationScale: 1,
//   getFillColor: '@@=fillColor || [255, 128, 18]',
//   getLineColor: [0, 0, 0],
//   getLineWidth: 10,
//   // lineWidthUnits,
//   // lineWidthScale,
//   lineWidthMinPixels: 10,
//   // lineWidthMaxPixels,
//   // lineJointRounded,
//   // lineMiterLimit,
//   // lineDashJustified,
//   getElevation: '@@=elevation || 1',
// },
//   ],
// };
// if (publicData) {
//   json.layers.push({
//     id: 'osm-context',
//     '@@type': 'GeoJsonLayer',
//     coordinateSystem: '@@#COORDINATE_SYSTEM.METER_OFFSETS',
//     modelMatrix: publicData.modelMatrix,
//     data: publicData.buildings,
//     pickable: false,
//     stroked: false,
//     filled: false,
//     extruded: false,
//     pointType: 'circle',
//     lineWidthScale: 1,
//     lineWidthMinPixels: 1,
//     getFillColor: [160, 160, 180, 200],
//     getLineColor: [100, 100, 100, 100],
//     getPointRadius: 100,
//     getLineWidth: 1,
//     getElevation: 30,
//   });
// }

// if (data?.buildings) {
//   json.layers.push({
//     id: 'bsm-layer',
//     '@@type': 'SolidPolygonLayer',
//     //'@@type': 'GeoJsonLayer',
//     data: data.buildings,
//     modelMatrix: data.modelMatrix,
//     opacity: 1,
//     autoHighlight: true,
//     highlightColor: [100, 150, 250, 255],
//     extruded: true,
//     wireframe: true,
//     pickable: true,
//     isClickable: true,
//     coordinateSystem: '@@#COORDINATE_SYSTEM.METER_OFFSETS',
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
// viewer.setJson(json);
//     // protectedDataLayer.data = protectedData.buildings;
//     // protectedDataLayer.modelMatrix = protectedData.modelMatrix;
//     //   viewer.setLayerProps('bsm-layer', {
//     //     data: protectedData.buildings,
//     //     modelMatrix: protectedData.modelMatrix,
//     //     onDragEnd: updateTimeline,
//     //   });
//     //   viewer.setLayerState('bsm-layer', {
//     //     url: 'http://localhost:9000/files/citymodel/CityModelWithBSMResults.json',
//     //     isLoaded: true,
//     //   });
//     //   viewer.render();
//   }
// }
// if (viewer) {
//   console.log('get tileset');
//   viewer.setJson({
// views: [
//   {
//     '@@type': 'MapView',
//     id: 'mainview',
//     controller: true,
//   },
// ],
// viewState: {
//   mainview: {
//     longitude: -75.152408, // -75.61209430782448, //11.9746,
//     latitude: 39.946975, //40.042530611425896, //57.7089,
//     zoom: 14,
//     target: [0, 0, 0],
//     pitch: 60,
//     bearing: 0,
//   },
// },
// layers: [
//   {
//     '@@type': 'Tile3DLayer',
//     //data: 'http://localhost:9000/files/3dtiles/1.1/Batched/BatchedColors/tileset.json',
//     data: 'http://localhost:9000/files/3dtiles/1.1/SparseImplicitQuadtree/tileset.json',
//     //loader: '@@#Tiles3DLoader',
//   },
//   ],
// });
// }
// if (viewer) {
//   console.log('get tileset');
//   viewer.setJson({
//     // views: [
//     //   {
//     //     '@@type': 'MapView',
//     //     id: 'mainview',
//     //     controller: true,
//     //   },
//     // ],
//     // viewState: {
//     //   mainview: {
//     //     longitude: -75.152408, // -75.61209430782448, //11.9746,
//     //     latitude: 39.946975, //40.042530611425896, //57.7089,
//     //     zoom: 14,
//     //     target: [0, 0, 0],
//     //     pitch: 60,
//     //     bearing: 0,
//     //   },
//     // },
//     layers: [
//       {
//         '@@type': 'MVTLayer',
//         //data: 'http://localhost:9000/files/3dtiles/1.1/Batched/BatchedColors/tileset.json',
//         data: 'http://localhost:9000/tiles/{z}/{x}/{y}',
//       },
//     ],
//   });
//   }
// }, [viewer, data]); //[publicData, protectedData, viewer]);
