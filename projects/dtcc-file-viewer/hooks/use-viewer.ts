import {useState, useEffect, useMemo} from 'react';
import {Observable} from '../lib/Observable';
import {Viewer} from '@dtcv/viewer';

/*
 * This is the app state management for the viewer data and where to store layer data and view state
 * Note that the @dtcv/viewer library has some helper layers that should make it easier to add certain kinds of city data
 * See the example applications on how to use these layers from this file by calling viewerState.viewer.setJson()
 */
export type ViewerStore = {
  viewer: Viewer | null;
  isLoading: boolean;
};

type LayerState = {
  id: string;
} & any;

type LayerStore = LayerState[];

const viewerStore = new Observable<ViewerStore>({
  viewer: null,
  isLoading: false,
});

const layerStore = new Observable<LayerStore>([]);

export const useViewer = () => {
  const [viewerState, setViewerState] = useState(viewerStore.get());
  const [layerState, setLayerState] = useState(layerStore.get());
  const [isInit, setIsInit] = useState<boolean>(false);

  useEffect(() => {
    return viewerStore.subscribe(setViewerState);
  }, []);
  useEffect(() => {
    return layerStore.subscribe(setLayerState);
  }, []);

  const viewerActions = useMemo(() => {
    return {
      initViewer: (ref: HTMLDivElement) => {
        console.log(ref);
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
      addLayer: (layer: LayerState) => {
        const existingLayer = layerState.find(l => l.id === layer.id);
        if (existingLayer) {
          console.log('fix update existing layer state');
        } else {
          layerStore.set([...layerState, layer]);
        }
      },
    };
  }, [viewerState]);

  /*
   * Use the trigger array of useEffect to listen to changes in state and call the viewer (setProps, setJson, etc) to render
   */
  useEffect(() => {
    if (!isInit) {
      return;
    }
    viewerState.viewer.setJson({
      layers: layerState,
    });
  }, [isInit, layerState]);

  return {
    viewerState,
    viewerActions,
  };
};
