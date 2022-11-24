// *** Settings for labels, units and rounding for the keys of various options
const propertyLabels: {
  [key: string]: string;
} = {
  deliveredEnergy: 'Delivered energy',
  deliveredEnergy2020: 'Delivered energy 2020',
  deliveredEnergy2030: 'Delivered energy 2030',
  deliveredEnergy2050: 'Delivered energy 2050',
  primaryEnergy: 'Primary energy',
  primaryEnergy2020: 'Primary energy 2020',
  primaryEnergy2030: 'Primary energy 2030',
  primaryEnergy2050: 'Primary energy 2050',
  finalEnergy: 'Final energy',
  finalEnergy2020: 'Final energy 2020',
  finalEnergy2030: 'Final energy 2030',
  finalEnergy2050: 'Final energy 2050',
  ghgEmissions: 'GHG emissions',
  ghgEmissions2020: 'GHG emissions 2020',
  ghgEmissions2030: 'GHG emissions 2030',
  ghgEmissions2050: 'GHG emissions 2050',
  heatDemand: 'Heat demand',
  heatDemand2020: 'Heat demand 2020',
  heatDemand2030: 'Heat demand 2030',
  heatDemand2050: 'Heat demand 2050',
};

// these are the units, but could be done with enum instead
const units: {
  [key: string]: string;
} = {
  deliveredEnergy: 'kWh',
  deliveredEnergyTimeline: 'MWh',
  deliveredEnergyM2: 'kWh/m²',
  deliveredEnergy2020: 'kWh',
  deliveredEnergy2030: 'kWh',
  deliveredEnergy2050: 'kWh',
  primaryEnergy: 'kWh',
  primaryEnergyTimeline: 'MWh',
  primaryEnergyM2: 'kWh/m²',
  primaryEnergy2020: 'kWh',
  primaryEnergy2030: 'kWh',
  primaryEnergy2050: 'kWh',
  finalEnergy: 'kWh',
  finalEnergyTimeline: 'MWh',
  finalEnergyM2: 'kWh/m²',
  finalEnergy2020: 'kWh',
  finalEnergy2030: 'kWh',
  finalEnergy2050: 'kWh',
  ghgEmissions: 'kgCO2-eq.',
  ghgEmissionsTimeline: 'kgCO2-eq.',
  ghgEmissionsM2: 'kgCO2-eq./m²',
  ghgEmissions2020: 'kgCO2-eq.',
  ghgEmissions2030: 'kgCO2-eq.',
  ghgEmissions2050: 'kgCO2-eq.',
  heatDemand: 'kWh',
  heatDemandTimeline: 'MWh',
  heatDemandM2: 'kWh/m²',
  heatDemand2020: 'kWh',
  heatDemand2030: 'kWh',
  heatDemand2050: 'kWh',
};

// if needs to be rounded
const rounding: {
  [key: string]: number;
} = {
  height: 1,
  heatedFloorArea: 0,
  deliveredEnergy: 0,
  deliveredEnergy2020: 0,
  deliveredEnergy2030: 0,
  deliveredEnergy2050: 0,
  primaryEnergy: 0,
  primaryEnergy2020: 0,
  primaryEnergy2030: 0,
  primaryEnergy2050: 0,
  finalEnergy: 0,
  finalEnergy2020: 0,
  finalEnergy2030: 0,
  finalEnergy2050: 0,
  ghgEmissions: 0,
  ghgEmissions2020: 0,
  ghgEmissions2030: 0,
  ghgEmissions2050: 0,
  heatDemand: 0,
  heatDemand2020: 0,
  heatDemand2030: 0,
  heatDemand2050: 0,
};

// **** Settings for selecting properties/indicator ***** //

export type SelectablePropertyKey =
  | 'finalEnergyM2'
  | 'heatDemandM2'
  | 'primaryEnergyM2'
  | 'deliveredEnergyM2'
  | 'ghgEmissionsM2';

export type PropertyKeyOption = {
  key: SelectablePropertyKey;
  label: string;
  unit: string;
  rounding: number;
};

// this is shown in the top action menu
const propertyKeyOptions: PropertyKeyOption[] = [
  'finalEnergyM2',
  'heatDemandM2',
  'primaryEnergyM2',
  'deliveredEnergyM2',
  'ghgEmissionsM2',
].map(key => ({
  key: key as SelectablePropertyKey,
  label: propertyLabels[key],
  unit: units[key],
  rounding: rounding[key],
}));

// **** Settings for selecting year ***** //

const yearLabels: {
  [key: string]: string;
} = {
  '2020': '2020',
  '2050_2_5': '2050 (2.5)',
  '2050_4_5': '2050 (4.5)',
  '2050_8_5': '2050 (8.5)',
};

const yearOptions = ['2020', '2050_2_5', '2050_4_5', '2050 (8.5)'].map(key => ({
  key,
  label: yearLabels[key],
}));

// **** Settings for selecting base map ***** //

const baseMapLabels: {
  [key: string]: string;
} = {
  '2020': '2020',
  '2050': '2050',
};

const baseMapOptions = ['2020', '2050'].map(key => ({
  key,
  label: baseMapLabels[key],
}));

export {
  propertyLabels,
  units,
  rounding,
  propertyKeyOptions,
  yearLabels,
  yearOptions,
  baseMapLabels,
  baseMapOptions,
};
