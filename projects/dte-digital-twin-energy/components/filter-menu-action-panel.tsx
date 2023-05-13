import { Switch } from '@headlessui/react';
import { useUi } from '../hooks/use-ui';
import ActionPanelMenu from './action-panel-menu';
import { CheckIcon } from '@heroicons/react/24/outline';
import { filterBuildingOptions, filterGridOptions } from '../lib/constants';

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(' ');
}

type FilterMenuActionPanelProps = {};
export default function FilterMenuActionPanel(
  props: FilterMenuActionPanelProps
) {
  const { actions: uiActions, state: uiState } = useUi();

  const filterButtonBaseStyle =
    'relative inline-flex items-center px-3 py-2 text-sm font-semibold ring-1 ring-inset ring-gray-300 focus:z-10';

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
    <div className="">
      <ActionPanelMenu
        onSelect={uiActions.setSelectedFilterBuildingOption}
        name={filterLabels[uiState.selectedFilterBuildingOption]}
        selectedKey={uiState.selectedFilterBuildingOption}
        options={filterBuildingOptions}
        roundedClass="rounded-l-md"
        checkIcon={uiState.filterButton === 'buildings'}
      ></ActionPanelMenu>
      <span className="isolate inline-flex">
        <button
          onClick={() => uiActions.setFilterButton('districts')}
          type="button"
          className={classNames(
            uiState.filterButton === 'districts'
              ? 'bg-gray-700 text-white'
              : 'bg-white text-gray-900',
            filterButtonBaseStyle
          )}
        >
          {uiState.filterButton === 'districts' ? (
            <CheckIcon className="-ml-0.5 h-5 w-5" aria-hidden="true" />
          ) : null}
          District
        </button>
        <button
          onClick={() => uiActions.setFilterButton('baseAreas')}
          type="button"
          className={classNames(
            uiState.filterButton === 'baseAreas'
              ? 'bg-gray-700 text-white'
              : 'bg-white text-gray-900',
            filterButtonBaseStyle
          )}
        >
          {uiState.filterButton === 'baseAreas' ? (
            <CheckIcon className="-ml-0.5 h-5 w-5" aria-hidden="true" />
          ) : null}
          Solar
        </button>
        <button
          onClick={() => uiActions.setFilterButton('primaryAreas')}
          type="button"
          className={classNames(
            uiState.filterButton === 'primaryAreas'
              ? 'bg-gray-700 text-white'
              : 'bg-white text-gray-900',
            filterButtonBaseStyle
          )}
        >
          {uiState.filterButton === 'primaryAreas' ? (
            <CheckIcon className="-ml-0.5 h-5 w-5" aria-hidden="true" />
          ) : null}
          Renovation
        </button>
      </span>
      <ActionPanelMenu
        onSelect={uiActions.setSelectedFilterGridOption}
        name={filterLabels[uiState.selectedFilterGridOption]}
        selectedKey={uiState.selectedFilterGridOption}
        options={filterGridOptions}
        roundedClass="rounded-r-md"
        checkIcon={uiState.filterButton === 'grid'}
      ></ActionPanelMenu>
    </div>
  );
}
