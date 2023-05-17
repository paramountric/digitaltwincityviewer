import { Disclosure, Menu, Switch, Transition } from '@headlessui/react';
import { ChevronUpIcon, Square3Stack3DIcon } from '@heroicons/react/20/solid';
import { useUi } from '../../hooks/use-ui';
import { Fragment } from 'react';

export default function Layer() {
  const { state: uiState, actions: uiActions } = useUi();

  const classNames = (...classes: string[]) => {
    return classes.filter(Boolean).join(' ');
  };

  return (
    <Disclosure>
      {({ open }) => (
        <>
          <Disclosure.Button
            className={`flex w-full p-2 m-0 text-sm font-medium text-left text-white transition bg-gray-700 hover:bg-gray-500 focus:outline-none focus-visible:ring focus-visible:ring-gray-500 focus-visible:ring-opacity-75 ${
              open ? 'rounded-tr-md' : 'rounded-r-md'
            }`}
          >
            <Square3Stack3DIcon className="w-5 h-5" />
            <span className="mx-2">Layers</span>
            <ChevronUpIcon
              className={`${
                open ? 'rotate-180 transform' : ''
              } ml-auto h-5 w-5`}
            />
          </Disclosure.Button>
          <Transition
            as={Fragment}
            enter="transition ease-out duration-100"
            enterFrom="transform opacity-0 scale-95"
            enterTo="transform opacity-100 scale-100"
            leave="transition ease-in duration-75"
            leaveFrom="transform opacity-100 scale-100"
            leaveTo="transform opacity-0 scale-95"
          >
            <Disclosure.Panel className="flex flex-col w-64 gap-4 px-3 py-4 text-white bg-gray-700 rounded-br-md">
              <Switch.Group
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

              <Switch.Group
                as="div"
                className="flex items-center justify-between w-full"
              >
                <Switch.Label as="span" className="text-xs">
                  <span className="font-medium text-white">Satellite map</span>
                </Switch.Label>
                <Switch
                  checked={uiState.showLayerSatelliteMap}
                  onChange={uiActions.setShowLayerSatelliteMap}
                  className={classNames(
                    uiState.showLayerSatelliteMap
                      ? 'bg-gray-200'
                      : 'bg-gray-700',
                    'relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ring-2 ring-gray-200'
                  )}
                >
                  <span
                    aria-hidden="true"
                    className={classNames(
                      uiState.showLayerSatelliteMap
                        ? 'translate-x-5 bg-gray-500 '
                        : 'translate-x-0 bg-gray-200 ',
                      'pointer-events-none inline-block h-5 w-5 transform rounded-full shadow ring-0 transition duration-200 ease-in-out'
                    )}
                  />
                </Switch>
              </Switch.Group>
            </Disclosure.Panel>
          </Transition>
        </>
      )}
    </Disclosure>
  );
}
