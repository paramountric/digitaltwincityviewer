import {useState, useEffect, useMemo} from 'react';
import {Observable} from '../lib/Observable';
import {Viewer} from '@dtcv/viewer';

export type ViewerStore = {
  viewer: Viewer | null;
  cityId: string | null;
  offsetCenter: [number, number, number] | null; // lng lat for the loaded dataset (reuse for next layer of the same dataset)
  activeDataSetId: string | null;
  selectedObject: any | null;
};

const viewerStore = new Observable<ViewerStore>({
  viewer: null,
  cityId: null,
  activeDataSetId: null,
  selectedObject: null,
  offsetCenter: null,
});

export const useViewer = () => {
  const [viewerState, setViewerState] = useState(viewerStore.get());
  const [isInit, setIsInit] = useState<boolean>(false);

  useEffect(() => {
    return viewerStore.subscribe(setViewerState);
  }, []);

  const viewerActions = useMemo(() => {
    return {
      initViewer: (ref: HTMLDivElement) => {
        viewerStore.set({
          ...viewerState,
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
        return viewerState.viewer.getCity();
      },
      setMapCenter: (lng, lat) => {
        const state = viewerStore.get();
        state.viewer.setCenter([lng, lat], true);
      },
      // this is reused for next loaded layer, otherwise the layers do not align
      setOffsetCenter: (center?: [number, number, number] | null) => {
        const state = viewerStore.get();
        viewerStore.set({...state, offsetCenter: center});
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
    };
  }, [viewerState]);

  return {
    state: viewerState,
    actions: viewerActions,
  };
};
