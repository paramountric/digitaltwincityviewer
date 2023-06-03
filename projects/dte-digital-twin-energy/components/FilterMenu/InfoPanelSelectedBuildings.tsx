import { Fragment } from 'react';

type InfoPanelSelectdedBuildingsProps = {
  feature: any;
};

type DisplayDict = {
  [key: string]: string | number;
};

const displayProperties: string[] = [
  // 'UUID',
  'addr',
  'bt',
  'cy',
  'hs',
  'ech',
  'vs',
  'wsc',
  'wpv',
  // 'hgt',
  // 'bp',
  // 'bps',
  // 'hfa',
  // 'hgt',
  // 'pco',
  // 'ppl',
];

const propertyLabels: DisplayDict = {
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
};

const units: DisplayDict = {
  hgt: 'm',
  hfa: 'm²',
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

const InfoPanelSelectdedBuildings: React.FC<
  InfoPanelSelectdedBuildingsProps
> = props => {
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
    <div className="grid grid-cols-5">
      {propertySelection.map((item: any, i: number) => {
        const val = formatValue(props.feature.properties, item.property);
        return (
          <Fragment key={i}>
            <div className="col-span-2 p-1 mb-1 mr-1 font-semibold">
              {item.label || 'fixme'}:
            </div>
            <div className="col-span-3">
              {val || '-'} {units[item.property] || ''}
            </div>
          </Fragment>
        );
      })}
    </div>
  );
};

export default InfoPanelSelectdedBuildings;
