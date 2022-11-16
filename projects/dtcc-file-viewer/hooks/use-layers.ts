import {useState, useEffect, useMemo} from 'react';
import {Observable} from '../lib/Observable';
import {useViewer} from './use-viewer';
import {useUi} from './use-ui';

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

const layerStore = new Observable<LayerStore>([]);

export const useLayers = () => {
  const [layerState, setLayerState] = useState(layerStore.get());
  const {
    state: viewerState,
    actions: {setSelectedObject},
  } = useViewer();
  const {
    actions: {setShowRightPanel},
  } = useUi();

  useEffect(() => {
    return layerStore.subscribe(setLayerState);
  }, []);

  const layerActions = useMemo(() => {
    return {
      addLayer: (layer: LayerState) => {
        const state = layerStore.get();
        const existingLayer = state.find(l => l.id === layer.id);
        if (existingLayer) {
          console.log('fix update existing layer state');
        } else {
          layer.visible = true;
          if (layer['@@type'] === 'CityModelLayer') {
            layer.onClick = ({object}) => {
              if (object) {
                setSelectedObject(object);
                setShowRightPanel(true);
              }
            };
          }
          layerStore.set([...state, layer]);
        }
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
  }, [layerState]);

  /*
   * Use the trigger array of useEffect to listen to changes in state and call the viewer (setProps, setJson, etc) to render
   */
  useEffect(() => {
    if (viewerState.viewer) {
      viewerState.viewer.setJson({
        layers: layerState,
      });
    }
  }, [layerState]);

  return {
    state: layerState,
    actions: layerActions,
  };
};
