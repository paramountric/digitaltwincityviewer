import {useState, useEffect, useMemo} from 'react';
import {Observable} from '../lib/Observable';
import {Viewer} from '@dtcv/viewer';
import {City} from '@dtcv/cities';

/*
 * This is the app state management for the viewer data and where to store layer data and view state
 * Note that the @dtcv/viewer library has some helper layers that should make it easier to add certain kinds of city data
 * See the example applications on how to use these layers from this file by calling viewerState.viewer.setJson()
 */
export type ViewerStore = {
  viewer: Viewer | null;
  cityId: string | null;
  selectedObject: any | null;
};

const viewerStore = new Observable<ViewerStore>({
  viewer: null,
  cityId: null,
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
        console.log(viewerStore.get());
        console.log(viewerState);
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
      setSelectedObject: (selectedObject: string) => {
        const state = viewerStore.get();
        viewerStore.set({
          ...state,
          selectedObject,
        });
      },
      getSelectedObject: () => {},
    };
  }, [viewerState]);

  return {
    state: viewerState,
    actions: viewerActions,
  };
};
