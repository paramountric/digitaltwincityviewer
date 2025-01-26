import {useState, useEffect, useMemo} from 'react';
import {Observable} from '../lib/Observable';
import {Viewer} from '@dtcv/viewer';

export type ViewerStore = {
  viewer: Viewer | null;
  cityId: string | null;
  activeDataSetId: string | null;
  selectedObject: any | null;
};

const viewerStore = new Observable<ViewerStore>({
  viewer: null,
  cityId: null,
  activeDataSetId: null,
  selectedObject: null,
});

export const useViewer = () => {
  const [viewerState, setViewerState] = useState(viewerStore.get());
  const [isInit, setIsInit] = useState<boolean>(false);

  useEffect(() => {
    return viewerStore.subscribe(setViewerState);
  }, []);

  const viewerActions = useMemo(() => {
    return {
      initViewer: (ref: HTMLDivElement, onLoad: () => any) => {
        if (!isInit) {
          viewerStore.set({
            ...viewerState,
            viewer: new Viewer(
              {
                container: ref,
                onLoad: () => {
                  setIsInit(true);
                  onLoad();
                },
              },
              {
                longitude: 12.7401827,
                latitude: 56.0430155,
                zoom: 14,
                minZoom: 10,
                maxZoom: 18,
                pitch: 60,
              }
            ),
          });
        }
      },
      setCity: (cityId: string) => {
        const state = viewerStore.get();
        if (!state.viewer) {
          return;
        }
        state.viewer.setCityFromId(cityId);
        viewerStore.set({
          ...state,
          cityId,
        });
      },
      getCity: () => {
        const state = viewerStore.get();
        if (!state.viewer) {
          return;
        }
        return state.viewer.getCity();
      },
      setCenter: (lng: number, lat: number) => {
        const state = viewerStore.get();
        if (!state.viewer) {
          return;
        }
        state.viewer.setCenter([lng, lat], true);
      },
      setSelectedObject: (selectedObject: string) => {
        const state = viewerStore.get();
        viewerStore.set({
          ...state,
          selectedObject,
        });
      },
      getSelectedObject: () => {},
      setActiveDataSet: (dataSetId: string) => {
        const state = viewerStore.get();
        viewerStore.set({...state, activeDataSetId: dataSetId});
      },
    };
  }, [viewerState]);

  return {
    state: viewerState,
    actions: viewerActions,
  };
};
