import {useState, useEffect, useMemo} from 'react';
import {Observable} from '../lib/Observable';
import {
  propertyKeyOptions,
  yearOptions,
  baseMapOptions,
} from '../lib/constants';

export type UiStore = {
  selectedPropertyKey: string;
  selectedYearKey: string;
  selectedBaseMapKey: string;
  showTimelinePerM2: boolean;
};

const uiStore = new Observable<UiStore>({
  selectedPropertyKey: propertyKeyOptions[0].key,
  selectedYearKey: yearOptions[0].key,
  selectedBaseMapKey: baseMapOptions[0].key,
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
      setSelectedBaseMapKey: (selectedBaseMapKey: string) =>
        uiStore.set({...uiState, selectedBaseMapKey}),
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
    getPropertyUnit: (selectKey?: string): string => {
      const key = selectKey || uiState.selectedPropertyKey;
      return propertyKeyOptions.find(option => option.key === key)?.unit || '';
    },
  };
};
