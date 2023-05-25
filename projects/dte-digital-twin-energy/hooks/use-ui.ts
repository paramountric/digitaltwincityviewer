import { useState, useEffect, useMemo } from 'react';
import { Observable } from '../lib/Observable';
import {
  propertyKeyOptions,
  yearOptions,
  degreeOptions,
} from '../lib/constants';

type ScenarioKeys = 'energy' | 'solar' | 'renovation';
type FilterButtons =
  | 'buildings'
  | 'districts'
  | 'baseAreas'
  | 'primaryAreas'
  | 'grid';
type BuildingFilterOptions = 'all' | 'selection' | 'single';
type GridFilterOptions = 'grid1km' | 'grid500m' | 'grid250m';

export type UiStore = {
  selectedPropertyKey: string;
  selectedYearKey: string;
  selectedDegreeKey: string;
  showTimelinePerM2: boolean;
  selectedAggregator: string;
  showScenario: boolean;
  showPins: boolean;
  scenarioKey: ScenarioKeys;
  filterButton: FilterButtons;
  selectedFilterBuildingOption: BuildingFilterOptions;
  selectedFilterGridOption: GridFilterOptions;
  showLayerPlannedDevelopment: boolean;
  showLayerSatelliteMap: boolean;
  showLayerWater: boolean;
  showLayerStreets: boolean;
  showLayerTrees: boolean;
};

const uiStore = new Observable<UiStore>({
  selectedPropertyKey: 'energy', //propertyKeyOptions[0].key,
  selectedYearKey: 'year', //yearOptions[0].key,
  selectedDegreeKey: 'degrees', //degreeOptions[0].key,
  showTimelinePerM2: false,
  selectedAggregator: 'none',
  showScenario: false,
  showPins: false,
  scenarioKey: 'energy',
  filterButton: 'buildings',
  selectedFilterBuildingOption: 'all',
  selectedFilterGridOption: 'grid1km',
  showLayerPlannedDevelopment: false,
  showLayerSatelliteMap: false,
  showLayerWater: false,
  showLayerStreets: false,
  showLayerTrees: false,
});

export const useUi = () => {
  const [uiState, setUiState] = useState(uiStore.get());

  useEffect(() => {
    return uiStore.subscribe(setUiState);
  }, []);

  const actions = useMemo(() => {
    return {
      setSelectedPropertyKey: (selectedPropertyKey: string) =>
        uiStore.set({ ...uiState, selectedPropertyKey }),
      setSelectedYearKey: (selectedYearKey: string) =>
        uiStore.set({ ...uiState, selectedYearKey }),
      setSelectedBaseMapKey: (selectedDegreeKey: string) =>
        uiStore.set({ ...uiState, selectedDegreeKey }),
      setShowTimelinePerM2: (showTimelinePerM2: boolean) =>
        uiStore.set({ ...uiState, showTimelinePerM2 }),
      setSelectedAggregator: (selectedAggregator: string) =>
        uiStore.set({ ...uiState, selectedAggregator }),
      setShowScenario: (showScenario: boolean) =>
        uiStore.set({ ...uiState, showScenario }),
      setScenario: (scenarioKey: ScenarioKeys) =>
        uiStore.set({ ...uiState, scenarioKey }),
      setShowPins: (showPins: boolean) => uiStore.set({ ...uiState, showPins }),
      setFilterButton: (filterButton: FilterButtons) =>
        uiStore.set({ ...uiState, filterButton }),
      setSelectedFilterBuildingOption: (
        selectedFilterBuildingOption: BuildingFilterOptions
      ) =>
        uiStore.set({
          ...uiState,
          filterButton: 'buildings',
          selectedFilterBuildingOption,
        }),
      setSelectedFilterGridOption: (
        selectedFilterGridOption: GridFilterOptions
      ) =>
        uiStore.set({
          ...uiState,
          filterButton: 'grid',
          selectedFilterGridOption,
        }),
      setShowLayerPlannedDevelopment: (showLayerPlannedDevelopment: boolean) =>
        uiStore.set({ ...uiState, showLayerPlannedDevelopment }),
      setShowLayerSatelliteMap: (showLayerSatelliteMap: boolean) =>
        uiStore.set({ ...uiState, showLayerSatelliteMap }),
      setShowLayerWater: (showLayerWater: boolean) =>
        uiStore.set({ ...uiState, showLayerWater }),
      setShowLayerStreets: (showLayerStreets: boolean) =>
        uiStore.set({ ...uiState, showLayerStreets }),
      setShowLayerTrees: (showLayerTrees: boolean) =>
        uiStore.set({ ...uiState, showLayerTrees }),
    };
  }, [uiState]);

  return {
    state: uiState,
    actions,
    getPropertyLabel: (selectKey?: string): string => {
      const key = selectKey || uiState.selectedPropertyKey;
      return (
        propertyKeyOptions.find(option => option.key === key)?.label ||
        'Select indicator'
      );
    },
    getCombinedKey: () => {
      const { selectedPropertyKey, selectedDegreeKey, selectedYearKey } =
        uiState;

      // all the 18 keys are the same for all the degrees
      if (selectedDegreeKey === '0' || selectedDegreeKey === 'degrees') {
        return `${selectedPropertyKey}18_25`;
      }

      if (selectedYearKey === '18' || selectedYearKey === 'year') {
        return `${selectedPropertyKey}18_${selectedDegreeKey}`;
      }
      // for all the other degrees the 50 is used
      return `${selectedPropertyKey}50_${selectedDegreeKey}`;
    },
    combinationIsSelected: () => {
      const { selectedPropertyKey, selectedYearKey, selectedDegreeKey } =
        uiState;
      if (
        selectedPropertyKey === 'energy' ||
        selectedYearKey === 'year' ||
        selectedDegreeKey === 'degrees'
      ) {
        return false;
      }
      return true;
    },
    getPropertyUnit: (selectKey?: string): string => {
      const key = selectKey || uiState.selectedPropertyKey;
      return propertyKeyOptions.find(option => option.key === key)?.unit || '';
    },
  };
};
