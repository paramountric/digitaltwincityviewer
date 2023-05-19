import { Switch } from '@headlessui/react';

type SwitchProps = {
  label: string;
  actions: any;
  state: any;
  dark?: boolean;
  labelBefore?: boolean;
};

export default function ButtonSwitch(props: SwitchProps) {
  const { label, actions, state, dark, labelBefore } = props;

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
        className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ring-2  ${
          dark
            ? state
              ? 'bg-gray-200'
              : 'bg-gray-700'
            : state
            ? 'bg-gray-500'
            : ''
        }
        ${dark ? 'ring-gray-200' : 'ring-gray-500'}`}
      >
        <span
          aria-hidden="true"
          className={`pointer-events-none inline-block h-5 w-5 transform rounded-full shadow ring-0 transition duration-200 ease-in-out ${
            dark
              ? state
                ? 'translate-x-5 bg-gray-500'
                : 'translate-x-0 bg-gray-200'
              : state
              ? 'translate-x-5 bg-gray-200'
              : 'translate-x-0 bg-gray-500'
          }`}
        />
      </Switch>
      <Switch.Label as="span" className="text-xs">
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
