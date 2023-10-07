import { Switch } from '@headlessui/react';
import { useUi } from '../../hooks/use-ui';
import Dropdown from '../Dropdown';
import { CheckIcon } from '@heroicons/react/24/outline';
import {
  filterBuildingOptions,
  filterGridOptions,
  filterAreaOptions,
  FilterButtons,
} from '../../lib/constants';
import ButtonSelect from '../ButtonSelect';

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(' ');
}

type FilterMenuActionPanelProps = {};

export default function FilterMenuActionPanel(
  props: FilterMenuActionPanelProps
) {
  const {
    actions: uiActions,
    state: {
      filterButton,
      selectedFilterBuildingOption,
      selectedFilterAreaOption,
      selectedFilterGridOption,
    },
  } = useUi();

  const filterLabels = [
    ...filterBuildingOptions,
    ...filterGridOptions,
    ...filterAreaOptions,
  ].reduce(
    (acc, opt) => {
      acc[opt.key] = opt.label;
      return acc;
    },
    {} as {
      [key: string]: string;
    }
  );

  const mainOptionKeys: FilterButtons[] = ['buildings', 'areas', 'grid'];
  const mainLabels = {
    buildings: 'Buildings',
    areas: 'Areas',
    grid: 'Grid',
  };

  const mainOptions = mainOptionKeys.map(key => ({
    key,
    label: mainLabels[key],
  }));

  return (
    <>
      <div className="flex shrink-0 w-[560px] pt-4">
        <span className="flex justify-center w-full isolate action-panel">
          {/* <Dropdown
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
        /> */}
          {mainOptions.map(opt => (
            <ButtonSelect
              key={opt.key}
              label={opt.label}
              actions={() => uiActions.setFilterButton(opt.key)}
              state={filterButton === opt.key}
            />
          ))}
        </span>
      </div>
      <div className="flex shrink-0 w-[560px]">
        {filterButton === 'buildings' && (
          <span className="flex justify-center w-full isolate action-panel">
            {filterBuildingOptions.map(opt => (
              <ButtonSelect
                key={opt.key}
                label={opt.label}
                actions={() =>
                  uiActions.setSelectedFilterBuildingOption(opt.key)
                }
                state={selectedFilterBuildingOption === opt.key}
              />
            ))}
          </span>
        )}
        {filterButton === 'areas' && (
          <span className="flex justify-center w-full isolate action-panel">
            {filterAreaOptions.map(opt => (
              <ButtonSelect
                key={opt.key}
                label={opt.label}
                actions={() => uiActions.setSelectedFilterAreaOption(opt.key)}
                state={selectedFilterAreaOption === opt.key}
              />
            ))}
          </span>
        )}
        {filterButton === 'grid' && (
          <span className="flex justify-center w-full isolate action-panel">
            {filterGridOptions.map(opt => (
              <ButtonSelect
                key={opt.key}
                label={opt.label}
                actions={() => uiActions.setSelectedFilterGridOption(opt.key)}
                state={selectedFilterGridOption === opt.key}
              />
            ))}
          </span>
        )}
      </div>
    </>
  );
}
