import { Disclosure, Switch } from '@headlessui/react';
import { ChevronUpIcon } from '@heroicons/react/20/solid';
import { useUi } from '../../hooks/use-ui';
import ButtonSwitch from '../ButtonSwitch';

export default function PanelNotes() {
  const { state: uiState, actions: uiActions } = useUi();
  return (
    <Disclosure>
      {({ open }) => (
        <>
          <Disclosure.Button className="flex w-full gap-2 p-2 mt-2 text-sm font-medium text-left text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 focus:outline-none focus-visible:ring focus-visible:ring-gray-500 focus-visible:ring-opacity-75">
            <span>Notes</span>
            <span>(34)</span>

            <ChevronUpIcon
              className={`${
                open ? 'rotate-180 transform' : ''
              } ml-auto h-5 w-5`}
            />
          </Disclosure.Button>
          <Disclosure.Panel className="p-3 text-xs text-gray-500">
            <div>
              <ButtonSwitch
                label={'MAP PINS OFF'}
                actions={uiActions.setShowPins}
                state={uiState.showPins}
              />
            </div>
            <div className="grid grid-cols-5"></div>
          </Disclosure.Panel>
        </>
      )}
    </Disclosure>
  );
}
