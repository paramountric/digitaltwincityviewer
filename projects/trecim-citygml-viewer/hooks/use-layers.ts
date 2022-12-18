import {useState, useEffect, useMemo} from 'react';
import {CityGmlParserOptions} from '@dtcv/citygml';
import {mat4} from 'gl-matrix';
import {Observable} from '../lib/Observable';
import {useViewer} from './use-viewer';
import {useUi} from './use-ui';
import {parser} from '../lib/parser';

// initial settings for layer
export type LayerConfig = {
  id: string;
  label: string;
  cityId: string;
  url: string;
  fileType: string;
  layerType: string;
  parserOptions: CityGmlParserOptions;
  offset: number[]; // x, y for translation in meters
  lat: number;
  lng: number;
  centerX: number; // the reference x in web mercator, used for translating to meter offset
  centerY: number; // the reference x in web mercator, used for translating to meter offset
  crs: string; // for the original data in the source
};

// layer state + any props that goes
export type LayerState = {
  id: string;
  visible: boolean;
  elevation: number; // extra z level for the layer, adjustable in the left panel
} & any;

type LayerStore = LayerState[];

const layerStore = new Observable<LayerStore>([]);

function getElevationMatrix(elevation) {
  return mat4.fromTranslation(mat4.create(), [0, 0, elevation]);
}

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
      loadLayer: async (layerConfig: LayerConfig) => {
        const state = layerStore.get();
        const {url} = layerConfig;
        // fetch data
        const response = await fetch(url);
        // process data
        await parser(response, layerConfig, (layerData: LayerState) => {
          layerData.visible = true;
          // add layer
          layerStore.set([...state, layerData]);
        });
      },
      addLayer: (layer: LayerState) => {
        const state = layerStore.get();
        const existingLayer = state.find(l => l.id === layer.id);
        if (existingLayer) {
          console.log('fix update existing layer state');
        } else {
          layer.visible = true;
          layer.elevation = layer.elevation || 0;
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
      addLayers: (layerArray: LayerState[]) => {
        const state = layerStore.get();
        layerArray.forEach(l => {
          l.visible = true;
          l.elevation = l.elevation || 0;
        });
        layerStore.set([...state, ...layerArray]);
      },
      resetLayers: () => {
        layerStore.set([]);
      },
      setLayerVisibility: (layerGroupId: string, isVisible: boolean) => {
        const layerStates = layerStore.get().map(l => {
          if (l.groupId === layerGroupId) {
            console.log('set visible', layerGroupId);
            return {...l, visible: isVisible};
          }
          return l;
        });
        layerStore.set(layerStates);
      },
      // need to return null if layer is not loaded, false if loaded and not visible
      getLayerVisibility: (layerGroupId: string): boolean | null => {
        const layerState = layerStore
          .get()
          .find(l => l.groupId === layerGroupId);
        if (!layerState) {
          return null;
        }
        return layerState.visible;
      },
      getLayerState: () => {
        return layerStore.get();
      },
      setLayerElevation: (layerGroupId: string, elevation = 0) => {
        const layerStates = layerStore.get().map(l => {
          if (l.groupId === layerGroupId) {
            const modelMatrix = Array.from(getElevationMatrix(elevation));
            return {...l, elevation, modelMatrix};
          }
          return l;
        });
        layerStore.set(layerStates);
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
