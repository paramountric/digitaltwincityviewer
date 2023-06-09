import { CheckIcon } from '@heroicons/react/24/outline';

type SelectProps = {
  label: string;
  actions: any;
  state: boolean;
};

export default function ButtonSelect(props: SelectProps) {
  const { label, actions, state } = props;

  return (
    <div
      className={`relative text-sm font-semibold ring-1 ring-inset w-full ring-gray-300 focus:z-50 ${
        state ? 'bg-gray-700 text-white' : 'bg-white text-gray-900'
      }`}
    >
      <button
        onClick={actions}
        type="button"
        className="flex items-center justify-center w-full gap-2 px-3 py-2 whitespace-nowrap"
      >
        {state && <CheckIcon className="w-5 h-5 -ml-0.5" aria-hidden="true" />}
        <span>{label}</span>
      </button>
    </div>
  );
}

// const scenarioKeyButtonBaseStyle =
// 'relative inline-flex items-center px-3 py-2 text-sm font-semibold ring-1 ring-inset ring-gray-300 focus:z-10';

{
  /* <button
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
          </button> */
}

// const filterButtonBaseStyle =
// 'relative inline-flex items-center px-3 py-2 text-sm font-semibold ring-1 ring-inset ring-gray-300 focus:z-10';

{
  /* <button
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
        </button> */
}
