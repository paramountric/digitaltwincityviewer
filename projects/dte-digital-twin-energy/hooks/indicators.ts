import {useState, useEffect, useMemo} from 'react';
import {Observable} from '../lib/Observable';

export type SelectablePropertyKey =
  | 'finalEnergy'
  | 'heatDemand'
  | 'primaryEnergy'
  | 'deliveredEnergy'
  | 'ghgEmissions';

export type PropertyKeyOption = {
  key: SelectablePropertyKey;
  label: string;
  unit: string;
};

export type IndicatorStore = {
  propertyKey: string;
  selectedYear: string;
  showTimelinePerM2: boolean;
};

const yearOptions = [
  {
    key: '2020',
    label: '2020',
  },
  //{key: '_2_5', label: '2050 (2.5)'},
  {key: '2050_4_5', label: '2050 (4.5)'},
  {key: '2050_8_5', label: '2050 (8.5)'},
];

// todo: use the constant file
const propertyKeyOptions: PropertyKeyOption[] = [
  {key: 'finalEnergy', label: 'Final energy', unit: 'kWh/m²'},
  {key: 'heatDemand', label: 'Heat demand', unit: 'kWh/m²'},
  {key: 'primaryEnergy', label: 'Primary energy', unit: 'kWh/m²'},
  {key: 'deliveredEnergy', label: 'Delivered energy', unit: 'kWh/m²'},
  {
    key: 'ghgEmissions',
    label: 'Greenhouse gas emissions',
    unit: 'kgCO2-eq./m²',
  },
];

const indicatorStore = new Observable<IndicatorStore>({
  propertyKey: propertyKeyOptions[0].key,
  selectedYear: yearOptions[0].key,
  showTimelinePerM2: false,
});

export const useIndicators = () => {
  const [indicatorState, setIndicatorState] = useState(indicatorStore.get());

  useEffect(() => {
    return indicatorStore.subscribe(setIndicatorState);
  }, []);

  const actions = useMemo(() => {
    return {
      setPropertyKey: (propertyKey: string) =>
        indicatorStore.set({...indicatorState, propertyKey}),
      setSelectedYear: (selectedYear: string) =>
        indicatorStore.set({...indicatorState, selectedYear}),
      setShowTimelinePerM2: (showTimelinePerM2: boolean) =>
        indicatorStore.set({...indicatorState, showTimelinePerM2}),
    };
  }, [indicatorState]);

  return {
    state: indicatorState,
    actions,
    propertyKeyOptions,
    yearOptions,
    getPropertyLabel: (selectKey?: string): string => {
      const key = selectKey || indicatorState.propertyKey;
      return (
        propertyKeyOptions.find(option => option.key === key)?.label ||
        'Select indicator'
      );
    },
    getPropertyUnit: (selectKey?: string): string => {
      const key = selectKey || indicatorState.propertyKey;
      return propertyKeyOptions.find(option => option.key === key)?.unit || '';
    },
  };
};
