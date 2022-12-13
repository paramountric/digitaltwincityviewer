import {useState, useEffect, useMemo} from 'react';
import {Observable} from '../lib/Observable';
import {useViewer} from './use-viewer';

/*
 * The layer state is any properties that goes into the layer
 * See each layer in the @dtcv/viewer package
 * if viewer.setJson is used, '@@type' key will be used in the viewer to map the layer type to layer instance
 * viewer.setProps can also be used to get direct access to Deck
 */
export type LayerState = {
  id: string;
  visible: boolean;
} & any;

type LayerStore = LayerState[];

const layerStore = new Observable<LayerStore>([]);

export const useLayers = () => {
  const [state, setState] = useState(layerStore.get());
  const {
    state: viewerState,
    actions: {renderLayers},
  } = useViewer();

  useEffect(() => {
    return layerStore.subscribe(setState);
  }, []);

  const actions = useMemo(() => {
    return {
      addLayer: (layer: LayerState) => {
        const state = layerStore.get();
        const existingLayer = state.find(l => l.id === layer.id);
        if (existingLayer) {
          console.log('fix update existing layer state');
        } else {
          layerStore.set([...state, layer]);
        }
      },
      resetLayers: () => {
        layerStore.set([]);
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
      getLayerState: () => {
        return layerStore.get();
      },
    };
  }, [state]);

  /*
   * Use the trigger array of useEffect to listen to changes in state and call the viewer (setProps, setJson, etc) to render
   */
  useEffect(() => {
    renderLayers(state);
  }, [state, viewerState.isInitialized]);

  return {
    state,
    actions,
  };
};
