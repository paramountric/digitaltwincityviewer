import {useState, useEffect, useCallback} from 'react';
import {Viewer} from '@dtcv/viewer';
import {usePublicData, useProtectedData} from './data';
import {useIndictors} from './indicators';
// import {Feature} from '@dtcv/geojson';

const useMaplibre = true;

export const useViewer = (): {
  initViewer: (ref: HTMLElement) => void;
  setData: (data: any) => void;
  viewer: Viewer | null;
  viewerLoading: boolean;
} => {
  const [viewer, setViewer] = useState<Viewer | null>(null);
  const publicData = usePublicData();
  const protectedData = useProtectedData();
  const {propertyKey, selectedYear, getTimelineData} = useIndictors();

  const updateTimeline = () => {
    console.log('test', viewer, propertyKey, selectedYear);
    if (!viewer || !propertyKey || !selectedYear) {
      return;
    }
    const visibleObjects = viewer.getVisibleObjects([
      'buildings-layer-polygons-lod-1',
    ]);
    const timelineData = getTimelineData(visibleObjects);
    console.log(timelineData);
  };

  useEffect(() => {
    if (viewer) {
      //const json: any = {
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
      //layers: [],
      //};
      //   if (publicData) {
      //     json.layers.push({
      //       id: 'osm-context',
      //       '@@type': 'GeoJsonLayer',
      //       //coordinateSystem: '@@#COORDINATE_SYSTEM.METER_OFFSETS',
      //       //modelMatrix: publicData.modelMatrix,
      //       data: publicData,
      //       pickable: false,
      //       stroked: false,
      //       filled: false,
      //       extruded: false,
      //       pointType: 'circle',
      //       lineWidthScale: 1,
      //       lineWidthMinPixels: 1,
      //       getFillColor: [160, 160, 180, 200],
      //       getLineColor: [100, 100, 100, 100],
      //       getPointRadius: 100,
      //       getLineWidth: 1,
      //       getElevation: 30,
      //     });
      //   }
      // const protectedDataLayer = {
      //   id: 'bsm-data',
      //   '@@type': 'SolidPolygonLayer',
      //   //'@@type': 'GeoJsonLayer',
      //   data: [] as Feature[],
      //   modelMatrix: [] as number[],
      //   opacity: 1,
      //   autoHighlight: true,
      //   highlightColor: [100, 150, 250, 255],
      //   extruded: false,
      //   wireframe: false,
      //   pickable: true,
      //   coordinateSystem: '@@#COORDINATE_SYSTEM.METER_OFFSETS',
      //   getPolygon: '@@=geometry.coordinates',
      //   getFillColor: '@@=properties.color || [255, 255, 255, 255]',
      //   getLineColor: [100, 100, 100],
      //   getElevation: '@@=properties.height || 0',
      //   useDevicePixels: true,
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
      // };
      if (protectedData) {
        // protectedDataLayer.data = protectedData.buildings;
        // protectedDataLayer.modelMatrix = protectedData.modelMatrix;
        viewer.setLayerProps('buildings-layer-polygons-lod-1', {
          data: protectedData.buildings,
          modelMatrix: protectedData.modelMatrix,
          onDragEnd: updateTimeline,
        });
        viewer.setLayerState('buildings-layer-polygons-lod-1', {
          url: 'http://localhost:9000/files/citymodel/CityModelWithBSMResults.json',
          isLoaded: true,
        });
        viewer.render();
      }
      // json.layers.push(protectedDataLayer);
      // viewer.setJson(json);
    }
    // if (viewer) {
    //   console.log('get tileset');
    //   viewer.setJson({
    //     views: [
    //       {
    //         '@@type': 'MapView',
    //         id: 'mainview',
    //         controller: true,
    //       },
    //     ],
    //     viewState: {
    //       mainview: {
    //         longitude: 0, // -75.61209430782448, //11.9746,
    //         latitude: 0, //40.042530611425896, //57.7089,
    //         zoom: 14,
    //         target: [0, 0, 0],
    //         pitch: 60,
    //         bearing: 0,
    //       },
    //     },
    //     layers: [
    //       {
    //         '@@type': 'Tile3DLayer',
    //         //data: 'http://localhost:9000/files/3dtiles/1.1/Batched/BatchedColors/tileset.json',
    //         data: 'http://localhost:9000/files/3dtiles/1.1/SparseImplicitQuadtree/tileset.json',
    //         //loader: '@@#Tiles3DLoader',
    //       },
    //     ],
    //   });
    // }
  }, [viewer, protectedData]); //[publicData, protectedData, viewer]);

  return {
    initViewer: ref => {
      if (viewer) {
        console.log('viewer is set');
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
            //canvas: ref,
            container: ref,
            // width: '100%',
            // height: '100%',
          },
          useMaplibre
        )
      );
    },
    setData: data => {
      if (!viewer) {
        console.error('cannot set data until viewer is initialized');
      }
      viewer?.setJson(data);
    },
    viewer,
    viewerLoading: false,
  };
};
