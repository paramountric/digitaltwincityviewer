import { Fragment } from 'react';
import { propertyLabels, units, rounding } from '../../lib/constants';
import { useUi } from '../../hooks/use-ui';

type InfoPanelSelectedBuildingsProps = {
  feature: any;
};

const displayProperties: string[] = [
  'numFeatures',
  'hfa',
  // 'de',
  // 'fe',
  // 'ge',
  // 'hd',
  // 'cd',
  // 'pe',
  // 'hgt',
  // 'bp',
  // 'bps',
  // 'hfa',
  // 'hgt',
  // 'pco',
  // 'ppl',
];

function formatValue(properties: any, propertyKey: string) {
  let val = properties[propertyKey];
  if (val && (rounding[propertyKey] || rounding[propertyKey] === 0)) {
    val = val.toFixed(rounding[propertyKey]);
  }
  return val;
}

const InfoPanelSelectedBuildings: React.FC<
  InfoPanelSelectedBuildingsProps
> = props => {
  const { state: uiState } = useUi();
  if (!uiState.showScenario) {
    return <div>Turn on scenarios to view predictions</div>;
  }
  if (!props.feature) {
    return <div>Choose the buildings you wish to see below</div>;
  }
  const selectedPropertiesToShow = displayProperties.reduce((memo, key) => {
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
      {selectedPropertiesToShow.map((item: any, i: number) => {
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

export default InfoPanelSelectedBuildings;
