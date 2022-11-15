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
};

/*
 * The layer state is any properties that goes into the layer
 * See each layer in the @dtcv/viewer package
 * if viewer.setJson is used, '@@type' key will be used in the viewer to map the layer type to layer instance
 */
type LayerState = {
  id: string;
  visible: boolean;
} & any;

type LayerStore = LayerState[];

const viewerStore = new Observable<ViewerStore>({
  viewer: null,
  cityId: null,
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
              zoom: 10,
              minZoom: 10,
              maxZoom: 18,
              pitch: 0,
            }
          ),
        });
      },
      addLayer: (layer: LayerState) => {
        const state = layerStore.get();
        const existingLayer = state.find(l => l.id === layer.id);
        if (existingLayer) {
          console.log('fix update existing layer state');
        } else {
          layer.visible = true;
          layerStore.set([...state, layer]);
        }
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
      setLayerVisibility: (layerId: string, isVisible: boolean) => {
        const layerStates = layerStore.get().map(l => {
          if (l.id === layerId) {
            return {...l, visible: isVisible};
          }
          return l;
        });
        layerStore.set(layerStates);
      },
      getCity: () => {
        return viewerState.viewer.getCity();
      },
      getLayerState: () => {
        return layerStore.get();
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
    layerState,
    actions: viewerActions,
  };
};
