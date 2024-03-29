import { Fragment } from 'react';
import {
  propertyLabels,
  filterCategoryLabels,
  units,
  rounding,
  filterCategoryKeys,
} from '../../lib/constants';
import { useUi } from '../../hooks/use-ui';

type InfoPanelSelectedBuildingsProps = {
  feature: any;
};

const displayProperties: string[] = [
  'numFeatures',
  // this is summed in aggregator
  'hfa',
  // this is special case in aggregator, ex (1936-2006)
  'cy',
  // these will be lists of strings compiled in aggregator if they are selected as categories
  ...filterCategoryKeys,
];

function formatValue(properties: any, propertyKey: string) {
  let val = properties[propertyKey];
  // if array, return a jsx list
  if (Array.isArray(val)) {
    return (
      <ul>
        {val.map((item: any, i: number) => (
          <li key={i}>{item}</li>
        ))}
      </ul>
    );
  }

  if (val && (rounding[propertyKey] || rounding[propertyKey] === 0)) {
    val = val.toFixed(rounding[propertyKey]);
  }
  return val;
}

const InfoPanelSelectedBuildings: React.FC<InfoPanelSelectedBuildingsProps> = (
  props
) => {
  const { state: uiState } = useUi();
  if (!uiState.showScenario) {
    return <div>Turn on scenarios to view predictions</div>;
  }
  if (!props.feature) {
    return <></>; //<div>Select the buildings you wish to see the data for below</div>;
  }
  const selectedPropertiesToShow = displayProperties.reduce((memo, key) => {
    const item = {
      property: key,
      label: propertyLabels[key] || filterCategoryLabels[key],
      unit: units[key],
      decimals: rounding[key],
    };
    memo.push(item);
    return memo;
  }, [] as any);

  return (
    <div className="flex flex-col overflow-y-auto divide-y bg-4 divide-dashed scroll-child">
      {selectedPropertiesToShow.map((item: any, i: number) => {
        const val = formatValue(props.feature.properties, item.property);
        return (
          <div key={i} className="flex justify-between gap-2 px-2 py-2 text-xs">
            <div className="font-semibold w-36">{item.label || 'fixme'}:</div>
            <div className="overflow-y-auto text-right max-h-48 scroll-child">
              {val || '-'} {units[item.property] || ''}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default InfoPanelSelectedBuildings;
