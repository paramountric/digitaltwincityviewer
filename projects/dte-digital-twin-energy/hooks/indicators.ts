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

export const useIndictors = () => {
  const [propertyKey, setPropertyKey] = useState(propertyKeyOptions[0].key);
  const [selectedYear, setSelectedYear] = useState(yearOptions[0]);
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
    selectedYear,
    setSelectedYear,
    showTimelinePerM2,
    setShowTimelinePerM2,
    getTimelineData,
  };
};

// function updateBuildingColors() {
//   if (!this.selectedPropertyKey || !this.selectedYear) {
//     return;
//   }
//   console.log(this.selectedPropertyKey, this.selectedYear);
//   this.viewer.setLayerStyle('buildings-layer-polygons-lod-1', {
//     color: {
//       sufficient: 150,
//       excellent: 60,
//       propertyKey: `${this.selectedPropertyKey}${this.selectedYear}M2`,
//     },
//   });
// }
