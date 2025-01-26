import {useState, useEffect, useMemo} from 'react';
import {cities} from '@dtcv/cities';
import {Observable} from '../lib/Observable';
import {LayerConfig} from './use-layers';

export type CityDatasetCollection = {
  [cityId: string]: CityDataset;
};

export type CityDataset = {
  cityLabel: string;
  layerConfigs: LayerConfig[];
};

// blend in official settings
const malmo = cities.find(c => c.id === 'malmo');

export const cityDatasets: CityDatasetCollection = {
  malmo: {
    cityLabel: 'Malmö',
    layerConfigs: [
      {
        id: 'malmo-buildings',
        label: 'Malmö byggnader',
        cityId: 'malmo',
        url: '/malmo.gml',
        fileType: 'gml',
        layerType: 'CityModelLayer',
        offset: [0, 0],
        lat: 56.0430155,
        lng: 12.7401827,
        crs: 'EPSG:3008',
      },
    ],
  },
};

export type UiStore = {
  isLoading: boolean;
  showLeftMenu: boolean;
  showRightMenu: boolean;
  activeCityId: string;
};

const uiStore = new Observable<UiStore>({
  isLoading: false,
  showLeftMenu: true,
  showRightMenu: false,
  activeCityId: 'malmo',
});

export const useUi = () => {
  const [uiState, setUiState] = useState(uiStore.get());

  useEffect(() => {
    return uiStore.subscribe(setUiState);
  }, []);

  const actions = useMemo(() => {
    return {
      setIsLoading: (isLoading: boolean) => setUiState({...uiState, isLoading}),
      setShowRightMenu: (showRightMenu: boolean) =>
        setUiState({...uiState, showRightMenu}),
      setShowLeftMenu: (showLeftMenu: boolean) =>
        setUiState({...uiState, showLeftMenu}),
      setActiveCityId: (activeCityId: string) =>
        setUiState({...uiState, activeCityId}),
      getSelectedCity: () => {
        return cityDatasets[uiState.activeCityId];
      },
    };
  }, [uiState]);

  return {
    state: uiState,
    actions,
  };
};
