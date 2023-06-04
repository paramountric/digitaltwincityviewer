import { useState, useEffect, useMemo } from 'react';
import { Observable } from '../lib/Observable';
import {
  propertyKeyOptions,
  yearOptions,
  degreeOptions,
  ScenarioKeys,
  FilterButtons,
  BuildingFilterOptions,
  GridFilterOptions,
  RenovationKeys,
  DegreeKey,
  YearKey,
  SelectablePropertyKey,
} from '../lib/constants';

export type UiStore = {
  selectedPropertyKey: string;
  selectedYearKey: YearKey;
  selectedDegreeKey: DegreeKey;
  showTimelinePerM2: boolean;
  selectedAggregator: string;
  showScenario: boolean;
  showPins: boolean;
  scenarioKey: ScenarioKeys;
  filterButton: FilterButtons;
  selectedFilterBuildingOption: BuildingFilterOptions;
  selectedFilterGridOption: GridFilterOptions;
  selectedRenovationOption: RenovationKeys;
  showLayerPlannedDevelopment: boolean;
  showLayerSatelliteMap: boolean;
  showLayerWater: boolean;
  showLayerStreets: boolean;
  showLayerTrees: boolean;
};

const uiStore = new Observable<UiStore>({
  selectedPropertyKey: propertyKeyOptions[0].key,
  selectedYearKey: yearOptions[0].key as YearKey,
  selectedDegreeKey: degreeOptions[0].key as DegreeKey,
  showTimelinePerM2: false,
  selectedAggregator: 'none',
  showScenario: false,
  showPins: false,
  scenarioKey: 'energy',
  filterButton: 'buildings',
  selectedFilterBuildingOption: 'all',
  selectedFilterGridOption: 'grid1km',
  selectedRenovationOption: 'ref',
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
      setSelectedPropertyKey: (selectedPropertyKey: SelectablePropertyKey) =>
        uiStore.set({ ...uiState, selectedPropertyKey }),
      setSelectedYearKey: (selectedYearKey: YearKey) =>
        uiStore.set({ ...uiState, selectedYearKey }),
      setSelectedBaseMapKey: (selectedDegreeKey: DegreeKey) =>
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
      setSelectedRenovationKey: (selectedRenovationOption: RenovationKeys) =>
        uiStore.set({ ...uiState, selectedRenovationOption }),
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
    // send in an indicator key to get the label for that indicator, otherwise the active one in the top bar is used
    getCombinedKey: (indicatorKey?: string) => {
      const {
        selectedPropertyKey,
        selectedDegreeKey,
        selectedYearKey,
        selectedRenovationOption,
      } = uiState;

      const renovationOptionKey = `_${selectedRenovationOption}`;

      const indicatorKeyToUse = indicatorKey || selectedPropertyKey;

      // all the 18 keys are the same for all the degrees
      if (selectedDegreeKey === '0') {
        return `${indicatorKeyToUse}18_25${renovationOptionKey}`;
      }

      if (selectedYearKey === '18') {
        return `${indicatorKeyToUse}18_${selectedDegreeKey}${renovationOptionKey}`;
      }

      console.log(
        'combined key',
        `${indicatorKeyToUse}50_${selectedDegreeKey}${renovationOptionKey}`
      );
      // for all the other degrees the 50 is used
      return `${indicatorKeyToUse}50_${selectedDegreeKey}${renovationOptionKey}`;
    },
    getScenarioPostfix: () => {
      const { selectedDegreeKey, selectedYearKey, selectedRenovationOption } =
        uiState;

      const renovationOptionKey = `_${selectedRenovationOption}`;

      // all the 18 keys are the same for all the degrees
      if (selectedDegreeKey === '0') {
        return `18_25${renovationOptionKey}`;
      }

      if (selectedYearKey === '18') {
        return `18_${selectedDegreeKey}${renovationOptionKey}`;
      }

      console.log(
        'combined key',
        `50_${selectedDegreeKey}${renovationOptionKey}`
      );
      // for all the other degrees the 50 is used
      return `50_${selectedDegreeKey}${renovationOptionKey}`;
    },
    getAggregation: () => {
      if (uiState.filterButton === 'buildings') {
        return '';
      }
      if (uiState.filterButton === 'districts') {
        return 'cityDistricts';
      }
      if (uiState.filterButton === 'baseAreas') {
        return 'baseAreas';
      }
      if (uiState.filterButton === 'grid') {
        return uiState.selectedFilterGridOption;
      }
    },
    getPropertyUnit: (selectKey?: string): string => {
      const key = selectKey || uiState.selectedPropertyKey;
      return propertyKeyOptions.find(option => option.key === key)?.unit || '';
    },
  };
};
