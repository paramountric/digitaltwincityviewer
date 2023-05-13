import { Disclosure, Menu, Switch } from '@headlessui/react';
import { ChevronUpIcon, Square3Stack3DIcon } from '@heroicons/react/20/solid';
import { useUi } from '../hooks/use-ui';

export default function LeftMenuLayerMenu() {
  const { state: uiState, actions: uiActions } = useUi();

  const classNames = (...classes: string[]) => {
    return classes.filter(Boolean).join(' ');
  };

  return (
    <Disclosure>
      {({ open }) => (
        <>
          <Disclosure.Button className="flex w-full bg-gray-100 justify-between rounded-md p-2 m-0 text-left text-sm text-gray-700 font-medium hover:bg-gray-200 focus:outline-none focus-visible:ring focus-visible:ring-gray-500 focus-visible:ring-opacity-75">
            <Square3Stack3DIcon className="h-5 w-5" />
            <span>Layers</span>
            <ChevronUpIcon
              className={`${open ? 'rotate-180 transform' : ''} h-5 w-5`}
            />
          </Disclosure.Button>
          <Disclosure.Panel className="p-3 text-xs text-gray-500">
            <Switch.Group as="div" className="flex items-center">
              <Switch.Label as="span" className="ml-3 text-sm">
                <span className="font-medium text-gray-900">
                  Planned developments
                </span>
              </Switch.Label>
              <Switch
                checked={uiState.showLayerPlannedDevelopment}
                onChange={uiActions.setShowLayerPlannedDevelopment}
                className={classNames(
                  uiState.showLayerPlannedDevelopment
                    ? 'bg-gray-600'
                    : 'bg-gray-200',
                  'relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-gray-600 focus:ring-offset-2'
                )}
              >
                <span
                  aria-hidden="true"
                  className={classNames(
                    uiState.showLayerPlannedDevelopment
                      ? 'translate-x-5'
                      : 'translate-x-0',
                    'pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out'
                  )}
                />
              </Switch>
            </Switch.Group>

            <Switch.Group as="div" className="flex items-center">
              <Switch.Label as="span" className="ml-3 text-sm">
                <span className="font-medium text-gray-900">Satellite map</span>
              </Switch.Label>
              <Switch
                checked={uiState.showLayerSatelliteMap}
                onChange={uiActions.setShowLayerSatelliteMap}
                className={classNames(
                  uiState.showLayerSatelliteMap ? 'bg-gray-600' : 'bg-gray-200',
                  'relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-gray-600 focus:ring-offset-2'
                )}
              >
                <span
                  aria-hidden="true"
                  className={classNames(
                    uiState.showLayerSatelliteMap
                      ? 'translate-x-5'
                      : 'translate-x-0',
                    'pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out'
                  )}
                />
              </Switch>
            </Switch.Group>
          </Disclosure.Panel>
        </>
      )}
    </Disclosure>
  );
}
