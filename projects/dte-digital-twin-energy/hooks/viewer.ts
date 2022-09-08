import {useState, useEffect, useCallback} from 'react';
import {Viewer, generateColor} from '@dtcv/viewer';
import {usePublicData, useProtectedData} from './data';
import {useIndicators} from './indicators';
import {Feature} from '@dtcv/geojson';
import {useUserInfo} from './userinfo';
import {useSelectedFeature} from './selected-feature';
import {cities} from '@dtcv/cities';

const gothenburg = cities.find((c: any) => c.id === 'gothenburg');
if (!gothenburg || !gothenburg.x) {
  throw new Error('City must be selected on app level');
}

const maplibreOptions = {
  longitude: gothenburg.lng,
  latitude: 57.7927,
};

export const useViewer = (): {
  initViewer: (ref: HTMLElement) => void;
  viewer: Viewer | null;
  viewerLoading: boolean;
  getVisibleFeatures: () => Feature[];
} => {
  const [viewer, setViewer] = useState<Viewer | null>(null);
  const [extent, setExtent] = useState<number[]>([]);

  //const publicData = usePublicData();
  const {data, refetch, updateTimelineData} = useProtectedData();
  const {data: publicData, refetch: refetchPublicData} = usePublicData();
  const userInfo = useUserInfo();
  const {state: indicatorState} = useIndicators();
  const {actions} = useSelectedFeature();

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
    if (!viewer || !data || !data.buildings) {
      return;
    }
    const json = {
      layers: [
        {
          id: 'bsm-layer',
          '@@type': 'SolidPolygonLayer',
          //'@@type': 'GeoJsonLayer',
          data: data.buildings,
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
        },
      ],
    };
    if (publicData) {
      json.layers.push({
        id: 'context-layer',
        //'@@type': 'SolidPolygonLayer',
        '@@type': 'GeoJsonLayer',
        data: publicData.buildings,
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
    viewer.setJson(json);
  };

  useEffect(() => {
    render();
  }, [viewer]);

  useEffect(() => {
    const {propertyKey, selectedYear} = indicatorState;
    if (!viewer || !data || !data.buildings || !propertyKey || !selectedYear) {
      return;
    }
    const colorStyle = {
      sufficient: 150,
      excellent: 60,
      propertyKey: `${propertyKey}${selectedYear}M2`,
    };
    console.log(data);

    for (const feature of data.buildings) {
      if (
        feature.properties &&
        colorStyle.propertyKey &&
        colorStyle.sufficient &&
        colorStyle.excellent
      ) {
        const color = generateColor(
          feature.properties[colorStyle.propertyKey],
          colorStyle.sufficient,
          colorStyle.excellent
        );
        feature.properties.color = color;
      }
    }
    // this should trigger the bottom panel initially (with all data)
    updateTimelineData(propertyKey, selectedYear);
    render();
  }, [indicatorState, viewer, data]);

  useEffect(() => {
    render();
  }, [publicData]);

  useEffect(() => {
    refetch();
    refetchPublicData();
  }, [userInfo]);

  useEffect(() => {
    if (viewer) {
      const result = viewer.getVisibleObjects(['bsm-layer']);
      const features = result.map((r: any) => r.object).filter(Boolean);
      const {propertyKey, selectedYear} = indicatorState;
      updateTimelineData(propertyKey, selectedYear, features);
    }
  }, [extent]);

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
        const result = viewer.getVisibleObjects(['bsm-layer']);
        console.log(result);
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
