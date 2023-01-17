import {useState, useEffect, useMemo} from 'react';
import {Observable} from '../lib/Observable';
import {propertyKeyOptions, yearOptions, degreeOptions} from '../lib/constants';

export type UiStore = {
  selectedPropertyKey: string;
  selectedYearKey: string;
  selectedDegreeKey: string;
  showTimelinePerM2: boolean;
};

const uiStore = new Observable<UiStore>({
  selectedPropertyKey: 'energy', //propertyKeyOptions[0].key,
  selectedYearKey: 'year', //yearOptions[0].key,
  selectedDegreeKey: 'degrees', //degreeOptions[0].key,
  showTimelinePerM2: false,
});

export const useUi = () => {
  const [uiState, setUiState] = useState(uiStore.get());

  useEffect(() => {
    return uiStore.subscribe(setUiState);
  }, []);

  const actions = useMemo(() => {
    return {
      setSelectedPropertyKey: (selectedPropertyKey: string) =>
        uiStore.set({...uiState, selectedPropertyKey}),
      setSelectedYearKey: (selectedYearKey: string) =>
        uiStore.set({...uiState, selectedYearKey}),
      setSelectedBaseMapKey: (selectedDegreeKey: string) =>
        uiStore.set({...uiState, selectedDegreeKey}),
      setShowTimelinePerM2: (showTimelinePerM2: boolean) =>
        uiStore.set({...uiState, showTimelinePerM2}),
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
      const {selectedPropertyKey, selectedDegreeKey} = uiState;

      // all the 18 keys are the same for all the degrees
      if (selectedDegreeKey === '0') {
        return `${selectedPropertyKey}18_25`;
      }
      // for all the other degrees the 50 is used
      return `${selectedPropertyKey}50_${selectedDegreeKey}`;
    },
    combinationIsSelected: () => {
      const {selectedPropertyKey, selectedYearKey, selectedDegreeKey} = uiState;
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
