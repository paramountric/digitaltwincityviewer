import {useState, useEffect} from 'react';
import {Viewer} from '@dtcv/viewer';

export const useViewer = (): {
  initViewer: (ref: HTMLCanvasElement) => void;
  viewer: Viewer | null;
  viewerLoading: boolean;
} => {
  const [viewer, setViewer] = useState<Viewer | null>(null);

  return {
    initViewer: ref => {
      if (viewer) {
        return;
      }
      console.log('init', ref);
      const newViewer = new Viewer({
        canvas: ref,
        width: '100%',
        height: '100%',
        onLoad: () => {
          // TS warning
          if (!newViewer) {
            return;
          }
          console.log('viewer loaded');

          const jsonData = {
            views: [
              {
                '@@type': 'MapView',
                id: 'mainview',
                controller: true,
              },
            ],
            viewState: {
              mainview: {
                longitude: 0,
                latitude: 0,
                zoom: 14,
                target: [0, 0, 0],
                pitch: 60,
                bearing: 0,
              },
            },
            layers: [],
          };
          newViewer.setJson(jsonData);
        },
      });
      setViewer(newViewer);
    },
    viewer,
    viewerLoading: false,
  };
};
