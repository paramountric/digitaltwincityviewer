import { Switch } from '@headlessui/react';
import { useUi } from '../../hooks/use-ui';
import Dropdown from '../Dropdown';
import { CheckIcon } from '@heroicons/react/24/outline';
import { filterBuildingOptions, filterGridOptions } from '../../lib/constants';
import ButtonSelect from '../ButtonSelect';

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(' ');
}

type FilterMenuActionPanelProps = {};

export default function FilterMenuActionPanel(
  props: FilterMenuActionPanelProps
) {
  const { actions: uiActions, state: uiState } = useUi();

  const filterLabels = [...filterBuildingOptions, ...filterGridOptions].reduce(
    (acc, opt) => {
      acc[opt.key] = opt.label;
      return acc;
    },
    {} as {
      [key: string]: string;
    }
  );

  return (
    <div className="flex">
      <span className="inline-flex isolate action-panel">
        <Dropdown
          onSelect={uiActions.setSelectedFilterBuildingOption}
          name={filterLabels[uiState.selectedFilterBuildingOption]}
          selectedKey={uiState.selectedFilterBuildingOption}
          options={filterBuildingOptions}
          checkIcon={uiState.filterButton === 'buildings'}
        />
        <ButtonSelect
          label={'Districts'}
          actions={() => uiActions.setFilterButton('districts')}
          state={uiState.filterButton === 'districts'}
        />
        <ButtonSelect
          label={'Base Areas'}
          actions={() => uiActions.setFilterButton('baseAreas')}
          state={uiState.filterButton === 'baseAreas'}
        />
        <ButtonSelect
          label={'Primary Areas'}
          actions={() => uiActions.setFilterButton('primaryAreas')}
          state={uiState.filterButton === 'primaryAreas'}
        />

        <Dropdown
          onSelect={uiActions.setSelectedFilterGridOption}
          name={filterLabels[uiState.selectedFilterGridOption]}
          selectedKey={uiState.selectedFilterGridOption}
          options={filterGridOptions}
          checkIcon={uiState.filterButton === 'grid'}
        />
      </span>
    </div>
  );
}
