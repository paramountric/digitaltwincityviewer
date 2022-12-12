import {useState, useEffect, useMemo} from 'react';
import {Observable} from '../lib/Observable';
import {Viewer} from '@dtcv/viewer';
import {LayerState} from './use-layers';

/*
 * This is the app state management for the viewer instance
 * Use this hook to proxy the Viewer component for app specific functionality
 */
export type ViewerStore = {
  viewer: Viewer | null;
  isLoading: boolean;
  isInitialized: boolean;
};

const viewerStore = new Observable<ViewerStore>({
  viewer: null,
  isLoading: false,
  isInitialized: false,
});

export const useViewer = () => {
  const [state, setState] = useState(viewerStore.get());

  useEffect(() => {
    return viewerStore.subscribe(setState);
  }, []);

  const actions = useMemo(() => {
    return {
      initViewer: (ref: HTMLDivElement) => {
        viewerStore.set({
          ...viewerStore.get(),
          viewer: new Viewer(
            {
              container: ref,
              longitude: 0,
              latitude: 0,
              zoom: 14,
              minZoom: 10,
              maxZoom: 18,
              pitch: 60,
              onLoad: () => {
                viewerStore.set({
                  ...viewerStore.get(),
                  isInitialized: true,
                });
              },
            },
            {
              // in general, common functionality should use the first props object above, the second is for maplibre specific props
              // center: [0, 0],
              // zoom: 14,
              // minZoom: 10,
              // maxZoom: 18,
              // pitch: 60,
            }
          ),
        });
      },
      // this is called from layer store, when layers state change
      renderLayers: (layers: LayerState[]) => {
        if (!state.viewer) {
          console.warn('viewer is not initialised');
          return;
        }
        state.viewer.setJson({
          layers,
        });
      },
    };
  }, [state]);

  return {
    state,
    actions,
  };
};
