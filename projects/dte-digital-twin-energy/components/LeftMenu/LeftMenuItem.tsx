import { Disclosure, Transition } from '@headlessui/react';
import { ChevronUpIcon, Square3Stack3DIcon } from '@heroicons/react/20/solid';
import { Fragment, ReactNode } from 'react';

type LeftMenuItemProps = {
  label: string;
  children: ReactNode;
};

export default function LeftMenuItem({ label, children }: LeftMenuItemProps) {
  return (
    <Disclosure as={'div'}>
      {({ open }) => (
        <>
          <Disclosure.Button
            className={`flex p-2 m-0 text-sm font-medium text-left text-white transition bg-gray-700 hover:bg-gray-500 focus:outline-none focus-visible:ring focus-visible:ring-gray-500 focus-visible:ring-opacity-75 ${
              open ? 'rounded-tr-md  w-full' : 'rounded-r-md w-32'
            }`}
          >
            <Square3Stack3DIcon className="w-5 h-5" />
            <span className="mx-2">{label}</span>
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
              {children}
            </Disclosure.Panel>
          </Transition>
        </>
      )}
    </Disclosure>
  );
}
