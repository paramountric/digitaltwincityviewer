import {useState, useEffect, useCallback} from 'react';
import {Viewer} from '@dtcv/viewer';
import {usePublicData, useProtectedData} from './data';

const useMaplibre = false;

export const useViewer = (): {
  initViewer: (ref: HTMLCanvasElement) => void;
  setData: (data: any) => void;
  viewer: Viewer | null;
  viewerLoading: boolean;
} => {
  const [viewer, setViewer] = useState<Viewer | null>(null);
  const publicData = usePublicData();
  const protectedData = useProtectedData();

  useEffect(() => {
    console.log(publicData, protectedData);
    if (viewer) {
      const json: any = {
        views: [
          {
            '@@type': 'MapView',
            id: 'mainview',
            controller: true,
          },
        ],
        viewState: {
          mainview: {
            longitude: 0, //11.9746,
            latitude: 0, //57.7089,
            zoom: 14,
            target: [0, 0, 0],
            pitch: 60,
            bearing: 0,
          },
        },
        layers: [],
      };
      if (publicData) {
        json.layers.push({
          id: 'osm-context',
          '@@type': 'GeoJsonLayer',
          //coordinateSystem: '@@#COORDINATE_SYSTEM.METER_OFFSETS',
          //modelMatrix: publicData.modelMatrix,
          data: publicData,
          pickable: false,
          stroked: false,
          filled: false,
          extruded: false,
          pointType: 'circle',
          lineWidthScale: 1,
          lineWidthMinPixels: 1,
          getFillColor: [160, 160, 180, 200],
          getLineColor: [100, 100, 100, 100],
          getPointRadius: 100,
          getLineWidth: 1,
          getElevation: 30,
        });
      }
      if (protectedData) {
        json.layers.push({
          id: 'bsm-data',
          '@@type': 'SolidPolygonLayer',
          //'@@type': 'GeoJsonLayer',
          modelMatrix: protectedData.modelMatrix,
          data: protectedData.buildings,
          opacity: 1,
          autoHighlight: true,
          highlightColor: [100, 150, 250, 255],
          extruded: false,
          wireframe: false,
          pickable: true,
          coordinateSystem: '@@#COORDINATE_SYSTEM.METER_OFFSETS',
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
    }
  }, [publicData, protectedData, viewer]);

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
      const newViewer = new Viewer(
        {
          canvas: ref,
          container: ref,
          width: '100%',
          height: '100%',
          onLoad: () => {
            setViewer(newViewer);
          },
          //   // TS warning
          //   if (!newViewer) {
          //     return;
          //   }
          //   console.log('viewer loaded');

          //   const jsonData = {
          //     views: [
          //       {
          //         '@@type': 'MapView',
          //         id: 'mainview',
          //         controller: true,
          //       },
          //     ],
          //     viewState: {
          //       mainview: {
          //         longitude: 0,
          //         latitude: 0,
          //         zoom: 14,
          //         target: [0, 0, 0],
          //         pitch: 60,
          //         bearing: 0,
          //       },
          //     },
          //     layers: [],
          //   };
          //   newViewer.setJson(jsonData);
          // },
        },
        useMaplibre
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
