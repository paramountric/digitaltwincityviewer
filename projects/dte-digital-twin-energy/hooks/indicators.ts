import {Feature} from '@dtcv/geojson';
import {useState} from 'react';

export type SelectablePropertyKey =
  | 'finalEnergy'
  | 'heatDemand'
  | 'primaryEnergy'
  | 'ghgEmissions';

export type PropertyKeyOption = {
  key: SelectablePropertyKey;
  label: string;
  unit: string;
};

const yearOptions = ['2020', '2030', '2050'];

const propertyKeyOptions: PropertyKeyOption[] = [
  {key: 'finalEnergy', label: 'Final energy', unit: 'kWh/m²'},
  {key: 'heatDemand', label: 'Heat demand', unit: 'kWh/m²'},
  {key: 'primaryEnergy', label: 'Primary energy', unit: 'kWh/m²'},
  {
    key: 'ghgEmissions',
    label: 'Greenhouse gas emissions',
    unit: 'kgCO2-eq./m²',
  },
];

export const useIndicators = () => {
  const [propertyKey, setPropertyKey] = useState<string>(
    propertyKeyOptions[0].key
  );
  const [selectedYear, setSelectedYear] = useState<string>(yearOptions[0]);
  const [showTimelinePerM2, setShowTimelinePerM2] = useState(false);

  function getTimelineData(features: Feature[]) {
    const timeResolution = 12;
    if (!features || features.length === 0) {
      return {
        total: Array(timeResolution).fill(0),
        perM2: Array(timeResolution).fill(0),
      };
    }
    const combinedKey = `${propertyKey}${selectedYear}`;
    const monthlyPropertyKey = `monthly${combinedKey
      .charAt(0)
      .toUpperCase()}${combinedKey.slice(1)}`;
    const sum = features.reduce(
      (acc, feature: Feature) => {
        if (!feature || !feature.properties) {
          return acc;
        }
        for (let i = 0; i < timeResolution; i++) {
          const propertyValue = feature.properties[monthlyPropertyKey][i] || 0;
          const floorArea = feature.properties?.heatedFloorArea || 0;
          acc[monthlyPropertyKey][i] += propertyValue;
          acc.floorArea[i] += floorArea;
        }
        return acc;
      },
      {
        [monthlyPropertyKey]: Array(timeResolution).fill(0),
        floorArea: Array(timeResolution).fill(0),
      }
    );
    return {
      total: sum[monthlyPropertyKey],
      perM2: sum[monthlyPropertyKey].map((val, i) => val / sum.floorArea[i]),
    };
  }

  return {
    propertyKey,
    setPropertyKey,
    propertyKeyOptions,
    getPropertyLabel: (selectKey?: string): string => {
      const key = selectKey || propertyKey;
      return (
        propertyKeyOptions.find(option => option.key === key)?.label ||
        'Select indicator'
      );
    },
    getPropertyUnit: (selectKey?: string): string => {
      const key = selectKey || propertyKey;
      return propertyKeyOptions.find(option => option.key === key)?.unit || '';
    },
    selectedYear,
    setSelectedYear,
    yearOptions,
    showTimelinePerM2,
    setShowTimelinePerM2,
    getTimelineData,
  };
};
