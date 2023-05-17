import { Switch } from '@headlessui/react';
import { useUi } from '../hooks/use-ui';
import { AnyTxtRecord } from 'dns';

type SwitchProps = {
  label: string;
  actions: any;
  state: any;
  dark?: boolean;
};

const ButtonSwitch: React.FC<SwitchProps> = (props) => {
  const { label, actions, state, dark } = props;

  function classNames(...classes: string[]) {
    return classes.filter(Boolean).join(' ');
  }
  return (
    <Switch.Group as="div" className="flex items-center">
      <Switch
        checked={state}
        onChange={actions}
        className={classNames(
          state ? 'bg-gray-500' : '',
          'relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ring-2 ring-gray-500'
        )}
      >
        <span
          aria-hidden="true"
          className={classNames(
            state ? 'translate-x-5 bg-gray-200' : 'translate-x-0 bg-gray-500',
            'pointer-events-none inline-block h-5 w-5 transform rounded-full shadow ring-0 transition duration-200 ease-in-out'
          )}
        />
      </Switch>
      <Switch.Label as="span" className="ml-3 text-xs">
        <span className="font-medium text-gray-900">{label}</span>
      </Switch.Label>
    </Switch.Group>
  );
};

export default ButtonSwitch;
