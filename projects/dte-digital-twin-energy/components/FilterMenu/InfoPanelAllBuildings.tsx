import { Fragment } from 'react';

type InfoPanelAllBuildingsProps = {
  feature: any;
};

type DisplayDict = {
  [key: string]: string | number;
};

const displayProperties: string[] = ['population', 'heatedFloorArea'];

const propertyLabels: DisplayDict = {
  population: 'Population',
  heatedFloorArea: 'Heated floor area',
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
    <div>
      <div>{props.feature.properties.name || 'Gothenburg'}</div>
      <div className="grid grid-cols-3">
        {propertySelection.map((item: any, i: number) => {
          const val = formatValue(props.feature.properties, item.property);
          return (
            <Fragment key={i}>
              <div className="col-span-2 p-1 mb-1 mr-1 font-semibold">
                {item.label || 'fixme'}:
              </div>
              <div className="col-span-1">
                {val || '-'} {units[item.property] || ''}
              </div>
            </Fragment>
          );
        })}
      </div>
    </div>
  );
};

export default InfoPanelAllBuildings;
