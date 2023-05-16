import { Disclosure, Switch } from '@headlessui/react';
import { ChevronUpIcon } from '@heroicons/react/20/solid';
import { useUi } from '../../hooks/use-ui';

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(' ');
}

export default function NotesPanel() {
  const { state: uiState, actions: uiActions } = useUi();
  return (
    <Disclosure>
      {({ open }) => (
        <>
          <Disclosure.Button className="flex justify-between w-full p-2 mt-2 text-sm font-medium text-left text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 focus:outline-none focus-visible:ring focus-visible:ring-gray-500 focus-visible:ring-opacity-75">
            <span>Notes</span>
            <span>(34)</span>

            <ChevronUpIcon
              className={`${open ? 'rotate-180 transform' : ''} h-5 w-5`}
            />
          </Disclosure.Button>
          <Disclosure.Panel className="p-3 text-xs text-gray-500">
            <div>
              <Switch.Group as="div" className="flex items-center">
                <Switch
                  checked={uiState.showPins}
                  onChange={uiActions.setShowPins}
                  className={classNames(
                    uiState.showPins ? 'bg-gray-600' : 'bg-gray-200',
                    'relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-gray-600 focus:ring-offset-2'
                  )}
                >
                  <span
                    aria-hidden="true"
                    className={classNames(
                      uiState.showPins ? 'translate-x-5' : 'translate-x-0',
                      'pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out'
                    )}
                  />
                </Switch>
                <Switch.Label as="span" className="ml-3 text-sm">
                  <span className="font-medium text-gray-900">
                    MAP PINS OFF{' '}
                  </span>
                </Switch.Label>
              </Switch.Group>
            </div>
            <div className="grid grid-cols-5"></div>
          </Disclosure.Panel>
        </>
      )}
    </Disclosure>
  );
}
