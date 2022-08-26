import {useState, useEffect, useCallback} from 'react';
import {Viewer} from '@dtcv/viewer';
import {useData} from './data';

export const useViewer = (): {
  initViewer: (ref: HTMLCanvasElement) => void;
  setData: (data: any) => void;
  viewer: Viewer | null;
  viewerLoading: boolean;
} => {
  const [viewer, setViewer] = useState<Viewer | null>(null);
  const data = useData();

  useEffect(() => {
    if (viewer) {
      viewer.setJson({
        views: [
          {
            '@@type': 'MapView',
            id: 'mainview',
            controller: true,
          },
        ],
        viewState: {
          mainview: {
            longitude: 11.9746,
            latitude: 57.7089,
            zoom: 14,
            target: [0, 0, 0],
            pitch: 60,
            bearing: 0,
          },
        },
        layers: [
          {
            '@@type': 'GeoJsonLayer',
            data,
            pickable: true,
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
          },
        ],
      });
    }
  }, [data, viewer]);

  return {
    initViewer: ref => {
      if (viewer) {
        return;
      }
      const newViewer = new Viewer({
        canvas: ref,
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
      });
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
