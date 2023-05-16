import { Disclosure } from '@headlessui/react';
import { ChevronUpIcon } from '@heroicons/react/20/solid';

export default function PredictionPanel() {
  return (
    <Disclosure>
      {({ open }) => (
        <>
          <Disclosure.Button className="flex w-full bg-gray-100 justify-between rounded-md p-2 mt-2 text-left text-sm text-gray-700 font-medium hover:bg-gray-200 focus:outline-none focus-visible:ring focus-visible:ring-gray-500 focus-visible:ring-opacity-75">
            <span>Predictions</span>
            <ChevronUpIcon
              className={`${open ? 'rotate-180 transform' : ''} h-5 w-5`}
            />
          </Disclosure.Button>
          <Disclosure.Panel className="p-3 text-xs text-gray-500">
            <div className="grid grid-cols-5"></div>
          </Disclosure.Panel>
        </>
      )}
    </Disclosure>
  );
}
