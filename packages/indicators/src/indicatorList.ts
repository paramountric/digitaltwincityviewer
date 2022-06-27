type Indicator = {
  id: string;
  name: string; // default english name, lets solve translations later, for now override translation in project apps
  sufficient?: number; // a decent value, used for color extrapolation
  excellent?: number; // a really good value, used for color extrapolation
  unit?: string; // a descriptive unit string
  round?: number; // number of decimals
};

// this is just an example
const indicatorList: {
  [indiatorId: string]: Indicator;
} = {
  buildingEnergyConsumption: {
    id: 'bildingEnergyConsumption',
    name: 'Building energy consumption',
    sufficient: 100,
    excellent: 60,
    unit: 'kWh/m2/year',
    round: 1,
  },
};

export function getIndicator(indicatorId: string): Indicator | null {
  return indicatorList[indicatorId] || null;
}
