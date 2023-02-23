// *** Settings for labels, units and rounding for the keys of various options
const propertyLabels: {
  [key: string]: string;
} = {
  de: 'Delivered energy',
  de18: 'Delivered energy 2020',
  de30: 'Delivered energy 2030',
  de50: 'Delivered energy 2050',
  pe: 'Primary energy',
  pe18: 'Primary energy 2020',
  pe30: 'Primary energy 2030',
  pe50: 'Primary energy 2050',
  fe: 'Final energy',
  fe18: 'Final energy 2020',
  fe30: 'Final energy 2030',
  fe50: 'Final energy 2050',
  ge: 'Greenhouse gas emissions',
  ge18: 'Greenhouse gas emissions 2020',
  ge30: 'Greenhouse gas emissions 2030',
  ge50: 'Greenhouse gas emissions 2050',
  hd: 'Heat demand',
  hd18: 'Heat demand 2020',
  hd30: 'Heat demand 2030',
  hd50: 'Heat demand 2050',
};

// these are the units, but could be done with enum instead
const units: {
  [key: string]: string;
} = {
  de: 'kWh',
  deTimeline: 'MWh',
  deM2: 'kWh/m²',
  de18: 'kWh',
  de30: 'kWh',
  de50: 'kWh',
  pe: 'kWh',
  peTimeline: 'MWh',
  peM2: 'kWh/m²',
  pe18: 'kWh',
  pe30: 'kWh',
  pe50: 'kWh',
  fe: 'kWh',
  feTimeline: 'MWh',
  feM2: 'kWh/m²',
  fe18: 'kWh',
  fe30: 'kWh',
  fe50: 'kWh',
  ge: 'kgCO2-eq.',
  geTimeline: 'kgCO2-eq.',
  geM2: 'kgCO2-eq./m²',
  ge18: 'kgCO2-eq.',
  ge30: 'kgCO2-eq.',
  ge50: 'kgCO2-eq.',
  hd: 'kWh',
  hdTimeline: 'MWh',
  hdM2: 'kWh/m²',
  hd18: 'kWh',
  hd30: 'kWh',
  hd50: 'kWh',
};

// if needs to be rounded
const rounding: {
  [key: string]: number;
} = {
  hgt: 1,
  hfa: 0,
  de: 0,
  de18: 0,
  de30: 0,
  de50: 0,
  pe: 0,
  pe18: 0,
  pe30: 0,
  pe50: 0,
  fe: 0,
  fe18: 0,
  fe30: 0,
  fe50: 0,
  ge: 0,
  ge18: 0,
  ge30: 0,
  ge50: 0,
  hd: 0,
  hd18: 0,
  hd30: 0,
  hd50: 0,
};

// **** Settings for selecting properties/indicator ***** //

export type SelectablePropertyKey = 'fe' | 'hd' | 'pe' | 'de' | 'ge';

export type PropertyKeyOption = {
  key: SelectablePropertyKey;
  label: string;
  unit: string;
  rounding: number;
};

// this is shown in the top action menu
const propertyKeyOptions: PropertyKeyOption[] = [
  'fe',
  'hd',
  'pe',
  'de',
  'ge',
].map(key => ({
  key: key as SelectablePropertyKey,
  label: propertyLabels[key],
  unit: units[key],
  rounding: rounding[key],
}));

// **** Settings for selecting year ***** //

// const yearLabels: {
//   [key: string]: string;
// } = {
//   '18': '2020',
//   '30': '2030',
//   '50': '2050',
// };

// const yearOptions = ['18', '30', '50'].map(key => ({
//   key,
//   label: yearLabels[key],
// }));

const yearLabels: {
  [key: string]: string;
} = {
  '18': 'The city of today (2020)',
  '50': 'The city of tomorrow (2050)',
};

const yearOptions = Object.keys(yearLabels).map(key => ({
  key,
  label: yearLabels[key],
}));

const degreeLabels: {
  [key: string]: string;
} = {
  '0': '0',
  '25': '2.5',
  '45': '4.5',
  '85': '8.5',
};

const degreeOptions = Object.keys(degreeLabels).map(key => ({
  key,
  label: degreeLabels[key],
}));

const aggregatorLabels: {
  [key: string]: string;
} = {
  none: 'no aggregator',
  grid1km: 'Grid 1km',
  grid250m: 'Grid 250m',
  cityDistricts: 'City Districts',
};

const aggregatorOptions = Object.keys(aggregatorLabels).map(key => ({
  key,
  label: aggregatorLabels[key],
}));

export {
  propertyLabels,
  units,
  rounding,
  propertyKeyOptions,
  yearLabels,
  yearOptions,
  degreeLabels,
  degreeOptions,
  aggregatorLabels,
  aggregatorOptions,
};
