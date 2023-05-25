import { Switch } from '@headlessui/react';
import { CheckIcon } from '@heroicons/react/24/outline';

type SwitchProps = {
  label: string;
  actions: any;
  state: any;
  size?: string;
  dark?: boolean;
  labelBefore?: boolean;
};

export default function ButtonSwitch(props: SwitchProps) {
  const { label, actions, state, dark, size = 'medium', labelBefore } = props;

  return (
    <Switch.Group
      as="div"
      className={`flex items-center justify-between gap-3 ${
        labelBefore && 'flex-row-reverse'
      }`}
    >
      <Switch
        checked={state}
        onChange={actions}
        className={`relative inline-flex items-center  flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ring-2 ${
          size === 'small' ? 'h-3 w-8' : 'h-6 w-11'
        } ${
          dark
            ? state
              ? 'bg-gray-200 ring-gray-200'
              : 'bg-gray-700 ring-gray-200'
            : state
            ? 'bg-lime-700 ring-lime-700'
            : 'ring-gray-500'
        }`}
      >
        <span
          aria-hidden="true"
          className={`pointer-events-none  transform rounded-full ring-0 transition duration-200 ease-in-out flex justify-center items-center ${
            size === 'small' ? 'h-2 w-2' : 'h-5 w-5'
          } ${
            dark
              ? state
                ? 'translate-x-5 bg-lime-700'
                : 'translate-x-0 bg-gray-200'
              : state
              ? 'translate-x-5 bg-gray-200'
              : 'translate-x-0 bg-gray-500'
          }`}
        >
          {state && size === 'medium' ? (
            <CheckIcon className="w-3 h-3 text-lime-700" />
          ) : (
            ''
          )}
        </span>
      </Switch>
      <Switch.Label
        as="span"
        className="text-xs select-none"
        // onClick={() => actions(!state)}
      >
        <span
          className={`font-medium ${dark ? 'text-white' : 'text-gray-900'}`}
        >
          {label}
        </span>
      </Switch.Label>
    </Switch.Group>
  );
}

{
  /* <Switch.Group
as="div"
className="flex items-center justify-between w-full"
>
<Switch.Label as="span" className="text-xs">
  <span className="font-medium text-white">
    Planned developments
  </span>
</Switch.Label>
<Switch
  checked={uiState.showLayerPlannedDevelopment}
  onChange={uiActions.setShowLayerPlannedDevelopment}
  className={classNames(
    uiState.showLayerPlannedDevelopment
      ? 'bg-gray-200'
      : 'bg-gray-700',
    'relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ring-2 ring-gray-200'
  )}
>
  <span
    aria-hidden="true"
    className={classNames(
      uiState.showLayerPlannedDevelopment
        ? 'translate-x-5 bg-gray-500 '
        : 'translate-x-0 bg-gray-200 ',
      'pointer-events-none inline-block h-5 w-5 transform rounded-full shadow ring-0 transition duration-200 ease-in-out'
    )}
  />
</Switch>
</Switch.Group>

 */
}

{
  /* <Switch.Group as="div" className="flex items-center">
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
        </Switch.Group> */
}
