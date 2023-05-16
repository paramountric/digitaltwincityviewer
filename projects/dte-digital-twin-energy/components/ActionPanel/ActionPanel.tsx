import { Switch } from '@headlessui/react';
import { useUi } from '../../hooks/use-ui';
import Dropdown from '../Dropdown';
import { CheckIcon } from '@heroicons/react/24/outline';
import {
  propertyLabels,
  propertyKeyOptions,
  yearLabels,
  yearOptions,
  degreeLabels,
  degreeOptions,
  aggregatorLabels,
  aggregatorOptions,
} from '../../lib/constants';

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(' ');
}

type ActionPanelProps = {};
const ActionPanel: React.FC<ActionPanelProps> = () => {
  const { actions: uiActions, state: uiState } = useUi();

  const scenarioKeyButtonBaseStyle =
    'relative inline-flex items-center px-3 py-2 text-sm font-semibold  ring-1 ring-inset ring-gray-300 focus:z-10';

  const sectionBaseStyle = 'flex items-center justify-center px-4 gap-2';

  return (
    <div className="z-20 flex justify-center divide-x-2 divide-gray-700 w-fit top-16">
      <div className={`${sectionBaseStyle}`}>
        <span className="inline-flex rounded-md shadow-sm isolate">
          <button
            onClick={() => uiActions.setScenario('energy')}
            type="button"
            className={classNames(
              'rounded-l-md',
              uiState.scenarioKey === 'energy'
                ? 'bg-gray-700 text-white'
                : 'bg-white text-gray-900',
              scenarioKeyButtonBaseStyle
            )}
          >
            {uiState.scenarioKey === 'energy' ? (
              <CheckIcon className="-ml-0.5 h-5 w-5" aria-hidden="true" />
            ) : null}
            Energy
          </button>
          <button
            onClick={() => uiActions.setScenario('solar')}
            type="button"
            className={classNames(
              uiState.scenarioKey === 'solar'
                ? 'bg-gray-700 text-white'
                : 'bg-white text-gray-900',
              scenarioKeyButtonBaseStyle
            )}
          >
            {uiState.scenarioKey === 'solar' ? (
              <CheckIcon className="-ml-0.5 h-5 w-5" aria-hidden="true" />
            ) : null}
            Solar
          </button>
          <button
            onClick={() => uiActions.setScenario('renovation')}
            type="button"
            className={classNames(
              'rounded-r-md',
              uiState.scenarioKey === 'renovation'
                ? 'bg-gray-700 text-white'
                : 'bg-white text-gray-900',
              scenarioKeyButtonBaseStyle
            )}
          >
            {uiState.scenarioKey === 'renovation' ? (
              <CheckIcon className="-ml-0.5 h-5 w-5" aria-hidden="true" />
            ) : null}
            Renovation
          </button>
        </span>
      </div>
      <div className={`${sectionBaseStyle}`}>
        <div className="inline-flex justify-center text-sm font-medium text-gray-700 focus:outline-none">
          See the
        </div>

        <Dropdown
          onSelect={uiActions.setSelectedPropertyKey}
          name={propertyLabels[uiState.selectedPropertyKey] || 'energy'}
          selectedKey={uiState.selectedPropertyKey}
          options={propertyKeyOptions}
          roundedClass="rounded-md"
        />

        <div className="inline-flex justify-center text-sm font-medium text-gray-700 focus:outline-none">
          for the city of
        </div>

        <Dropdown
          onSelect={uiActions.setSelectedYearKey}
          name={yearLabels[uiState.selectedYearKey] || 'year'}
          selectedKey={uiState.selectedYearKey}
          options={yearOptions}
          roundedClass="rounded-md"
        />
        <div className="inline-flex text-sm font-medium text-gray-700 justify-centerbg-white focus:outline-none">
          given the temperature rise of
        </div>

        <Dropdown
          onSelect={uiActions.setSelectedBaseMapKey}
          name={
            degreeLabels[uiState.selectedDegreeKey] || 0
              ? `${degreeLabels[uiState.selectedDegreeKey]}`
              : 'degrees'
          }
          selectedKey={uiState.selectedDegreeKey}
          options={degreeOptions}
          roundedClass="rounded-md"
        />
        {/* <div className="mr-1">
        <div className="inline-flex justify-center w-full px-4 py-2 mt-1 text-sm font-medium text-gray-700 bg-white border rounded-md focus:outline-none">
          aggregated by
        </div>
      </div>
      <Dropdown
        onSelect={uiActions.setSelectedAggregator}
        name={
          aggregatorLabels[uiState.selectedAggregator] || 'none'
            ? `${aggregatorLabels[uiState.selectedAggregator || 'none']}`
            : 'aggregator'
        }
        selectedKey={uiState.selectedDegreeKey}
        options={aggregatorOptions}
      ></Dropdown> */}
      </div>
      <div className={`${sectionBaseStyle} `}>
        <Switch.Group as="div" className="flex items-center">
          <Switch
            checked={uiState.showScenario}
            onChange={uiActions.setShowScenario}
            className={classNames(
              uiState.showScenario ? 'bg-gray-500' : '',
              'relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ring-2 ring-gray-500'
            )}
          >
            <span
              aria-hidden="true"
              className={classNames(
                uiState.showScenario
                  ? 'translate-x-5 bg-gray-200'
                  : 'translate-x-0 bg-gray-500',
                'pointer-events-none inline-block h-5 w-5 transform rounded-full shadow ring-0 transition duration-200 ease-in-out'
              )}
            />
          </Switch>
          <Switch.Label as="span" className="ml-3 text-xs">
            <span className="font-medium text-gray-900">SCENARIO OFF</span>
          </Switch.Label>
        </Switch.Group>
      </div>
    </div>
  );
};

export default ActionPanel;
