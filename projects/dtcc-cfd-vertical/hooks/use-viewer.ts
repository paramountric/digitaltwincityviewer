import {useState, useEffect, useMemo} from 'react';
import {Observable} from '../lib/Observable';
import {Viewer} from '@dtcv/viewer';
import {LayerState} from './use-layers';

export type ViewerStore = {
  viewer: Viewer | null;
  cityId: string | null;
  activeDataSetId: string | null;
  selectedObject: any | null;
  isInitialized: boolean;
};

const viewerStore = new Observable<ViewerStore>({
  viewer: null,
  cityId: null,
  activeDataSetId: null,
  selectedObject: null,
  isInitialized: false,
});

export const useViewer = () => {
  const [viewerState, setState] = useState(viewerStore.get());
  const [isInit, setIsInit] = useState<boolean>(false);

  useEffect(() => {
    return viewerStore.subscribe(setState);
  }, []);

  const viewerActions = useMemo(() => {
    return {
      initViewer: (ref: HTMLDivElement) => {
        const state = viewerStore.get();
        viewerStore.set({
          ...state,
          viewer: new Viewer(
            {
              container: ref,
              onLoad: () => {
                setIsInit(true);
              },
            },
            {
              longitude: 0,
              latitude: 0,
              zoom: 14,
              minZoom: 10,
              maxZoom: 18,
              pitch: 60,
            }
          ),
        });
      },
      setCity: (cityId: string) => {
        const state = viewerStore.get();
        state.viewer.setCityFromId(cityId);
        viewerStore.set({
          ...state,
          cityId,
        });
      },
      getCity: () => {
        const state = viewerStore.get();
        return state.viewer.getCity();
      },
      setCenter: (lng, lat) => {
        const state = viewerStore.get();
        state.viewer.setCenter([lng, lat], true);
      },
      setSelectedObject: (selectedObject: string) => {
        const state = viewerStore.get();
        viewerStore.set({
          ...state,
          selectedObject,
        });
      },
      setActiveDataSet: (dataSetId: string) => {
        const state = viewerStore.get();
        viewerStore.set({...state, activeDataSetId: dataSetId});
      },
      getSelectedObject: () => {},
      // this is called from layer store, when layers state change
      renderLayers: (layers: LayerState[]) => {
        const state = viewerStore.get();
        if (!state.viewer) {
          console.warn('viewer is not initialised');
          return;
        }
        state.viewer.setJson({
          layers,
        });
      },
    };
  }, [viewerState]);

  return {
    state: viewerState,
    actions: viewerActions,
  };
};
