import { ReactNode } from 'react';
import { ChevronUpIcon } from '@heroicons/react/20/solid';
import { Disclosure } from '@headlessui/react';

export default function FilterResultPanel({
  children,
  label,
}: {
  children: ReactNode;
  label: any;
}) {
  return (
    <Disclosure>
      {({ open }) => (
        <>
          <Disclosure.Button className="flex items-center justify-center w-full gap-2 px-2 py-3 font-bold text-left text-gray-700 border-t-2 border-gray-700 shrink-0 text-md hover:bg-gray-200 focus:outline-none focus-visible:ring focus-visible:ring-gray-500 focus-visible:ring-opacity-75">
            {label}
            <ChevronUpIcon
              className={`${
                open ? 'rotate-180 transform' : ''
              } ml-auto h-5 w-5`}
            />
          </Disclosure.Button>
          <Disclosure.Panel className="h-full p-3 overflow-y-auto text-gray-500 shrink scroll-child">
            {children}
          </Disclosure.Panel>
        </>
      )}
    </Disclosure>
  );
}
