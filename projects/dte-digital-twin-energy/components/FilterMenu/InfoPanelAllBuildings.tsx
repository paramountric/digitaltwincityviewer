import { Fragment } from 'react';

type InfoPanelAllBuildingsProps = {
  feature: any;
};

type DisplayDict = {
  [key: string]: string | number;
};

const displayProperties: string[] = [
  'size',
  'population',
  'heightAboveSeaLevel',
];

// Size: 447,8 km²
// Population: 631,000
// Height above mean sea level: 12 m

const propertyLabels: DisplayDict = {
  size: 'Size',
  population: 'Population',
  heightAboveSeaLevel: 'Height above mean sea level',
};

const units: DisplayDict = {
  heatedFloorArea: 'm²',
};

// if needs to be rounded
const rounding: DisplayDict = {
  height: 1,
  heatedFloorArea: 0,
  hfa: 0,
};

function formatValue(properties: any, propertyKey: string) {
  let val = properties[propertyKey];
  if (val && (rounding[propertyKey] || rounding[propertyKey] === 0)) {
    val = val.toFixed(rounding[propertyKey]);
  }
  return val;
}

const InfoPanelAllBuildings: React.FC<InfoPanelAllBuildingsProps> = props => {
  const propertySelection = displayProperties.reduce((memo, key) => {
    const item = {
      property: key,
      label: propertyLabels[key],
      unit: units[key],
      decimals: rounding[key],
    };
    memo.push(item);
    return memo;
  }, [] as any);
  return (
    <div className="mb-4 overflow-y-auto scroll-child ">
      {propertySelection.map((item: any, i: number) => {
        const val = formatValue(props.feature.properties, item.property);
        return (
          <div key={i} className="flex justify-between gap-2 px-2 text-xs">
            <div className="font-semibold w-38">{item.label || 'fixme'}:</div>
            <div className="overflow-y-auto text-right max-h-48 scroll-child">
              {val || '-'} {units[item.property] || ''}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default InfoPanelAllBuildings;
