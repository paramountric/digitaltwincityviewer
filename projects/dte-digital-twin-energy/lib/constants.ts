export type ScenarioKeys = 'energy' | 'solar' | 'renovation';
export type FilterButtons =
  | 'buildings'
  | 'districts'
  | 'baseAreas'
  | 'primaryAreas'
  | 'grid';
export type BuildingFilterOptions = 'all' | 'selection' | 'single';
export type GridFilterOptions = 'grid1km' | 'grid250m' | 'grid100m';
export type RenovationKeys = 'ref' | 'dr' | 'er' | 'hr';
export type SelectablePropertyKey = 'fe' | 'hd' | 'pe' | 'de' | 'ge' | 'cd';
export type DegreeKey = '0' | '25' | '45' | '85';
export type YearKey = '18' | '30' | '50';
export type SolarKeys = 'period';

export type PropertyKeyOption = {
  key: SelectablePropertyKey;
  label: string;
  unit: string;
  rounding: number;
};

export type SolarKeyOption = {
  key: SolarKeys;
  label: string;
  unit: string;
  rounding: number;
};

const propertyKeys: SelectablePropertyKey[] = [
  'fe',
  'hd',
  'pe',
  'de',
  'ge',
  'cd',
];
const yearKeys: YearKey[] = ['18', '50'];

// note that zero is the year 18 in property keys, all other keys have year 50 for the degrees
const degreeKeys: DegreeKey[] = ['0', '25', '45', '85'];

const renovationKeys: RenovationKeys[] = ['ref', 'dr', 'er', 'hr'];
const solarKeys: SolarKeys[] = ['period'];
const buildingFilterKeys = ['all', 'selection', 'single'];
const filterCategoryKeys = ['bt', 'hs', 'own', 'vs', 'ot', 'ech'];

// *** Settings for labels, units and rounding for the keys of various options
const propertyLabels: {
  [key: string]: string;
} = {
  // indicators
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
  cd: 'Cooling demand',
  cd18: 'Cooling demand 2020',
  cd30: 'Cooling demand 2030',
  cd50: 'Cooling demand 2050',
  // properties
  addr: 'Address',
  pco: 'Postal code',
  ppl: 'City',
  bp: 'Type',
  bps: 'Subtype',
  hgt: 'Height',
  hfa: 'Heated floor area',
  UUID: 'UUID',
  bt: 'Building type',
  cy: 'construction year',
  hs: 'Main heating system',
  ech: 'Energy carrier of the main heating system',
  vs: 'Ventilation system',
  wsc: 'Solar collector on the roof',
  wpv: 'Solar cells on the roof',
  numFeatures: 'Number of buildings',
};

const filterLabels: {
  [key: string]: string;
} = {
  energy: 'Energy',
  all: 'All',
  selection: 'A specific collection',
  single: 'Only one building',
};

// these are the units, but could be done with enum instead
const units: {
  [key: string]: string;
} = {
  // properties
  hgt: 'm',
  hfa: 'm²',
  de: 'kWh',
  // indicators
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
  cd: 'kWh',
  cdTimeline: 'MWh',
  cdM2: 'kWh/m²',
  cd18: 'kWh',
  cd30: 'kWh',
  cd50: 'kWh',
};

// if needs to be rounded
const rounding: {
  [key: string]: number;
} = {
  // properties
  height: 1,
  heatedFloorArea: 0,
  // indicators
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
  cd: 0,
  cd18: 0,
  cd30: 0,
  cd50: 0,
};

// **** Settings for selecting properties/indicator ***** //

// this is shown in the top action menu
const propertyKeyOptions: PropertyKeyOption[] = propertyKeys.map((key) => ({
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
  '18': 'today (2020)',
  // '30': 'in 10 years (2030)',
  '50': 'tomorrow (2050)',
};

const yearOptions = Object.keys(yearLabels).map((key) => ({
  key,
  label: yearLabels[key],
}));

const degreeLabels: {
  [key: string]: string;
} = {
  '0': '0°', // note that this is the year 18 in property keys, the degrees are year 50
  '25': '1°',
  '45': '1.5°',
  '85': '2°',
};

const degreeOptions = Object.keys(degreeLabels).map((key) => ({
  key,
  label: degreeLabels[key],
}));

const aggregatorLabels: {
  [key: string]: string;
} = {
  none: 'no aggregator',
  grid1km: 'Grid 1km',
  grid250m: 'Grid 250m',
  grid100m: 'Grid 100m',
  cityDistricts: 'City Districts',
  baseAreas: 'Base Areas',
  primaryAreas: 'Primary Areas',
};

const aggregatorOptions = Object.keys(aggregatorLabels).map((key) => ({
  key,
  label: aggregatorLabels[key],
}));

const filterBuildingOptions = buildingFilterKeys.map((key) => ({
  key,
  label: filterLabels[key],
}));

const filterGridOptions = [
  {
    key: 'grid1km',
    label: 'Grid 1km',
  },
  {
    key: 'grid250m',
    label: 'Grid 250m',
  },
  {
    key: 'grid100m',
    label: 'Grid 100m',
  },
];

const filterCategoryLabels: {
  [key: string]: string;
} = {
  bt: 'Building type',
  hs: 'Heating system',
  own: 'Ownership',
  vs: 'Ventilation system',
  ot: 'Owner type',
  ech: 'Energy carrier',
  // "by" buildingyear
  // "wsc": (Boolean, true if the building has an solar collector on the roof)

  // "wpv": (Boolean, true if the building has solar cells on the roof),
};

const filterCategoryOptions = filterCategoryKeys.map((key) => ({
  key,
  label: filterCategoryLabels[key],
}));

const renovationLabels = {
  ref: 'No renovation',
  dr: 'All',
  er: 'Envelope',
  hr: 'HVAC systems',
};

const renovationOptions: PropertyKeyOption[] = renovationKeys.map((key) => ({
  key: key as SelectablePropertyKey,
  label: renovationLabels[key],
  unit: units[key],
  rounding: rounding[key],
}));

const solarLabels: {
  [key: string]: string;
} = {
  period: 'Period',
};

const solarOptions: SolarKeyOption[] = solarKeys.map((key) => ({
  key: key as SolarKeys,
  label: solarLabels[key],
  unit: units[key],
  rounding: rounding[key],
}));

export {
  propertyLabels,
  units,
  rounding,
  propertyKeys,
  propertyKeyOptions,
  yearKeys,
  yearLabels,
  yearOptions,
  degreeKeys,
  degreeLabels,
  degreeOptions,
  aggregatorLabels,
  aggregatorOptions,
  filterBuildingOptions,
  filterGridOptions,
  renovationLabels,
  renovationOptions,
  solarLabels,
  solarOptions,
  filterCategoryOptions,
  filterCategoryKeys,
  filterCategoryLabels,
};
