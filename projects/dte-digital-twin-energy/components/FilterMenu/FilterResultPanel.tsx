import { ReactNode } from 'react';
import { ChevronUpIcon } from '@heroicons/react/20/solid';
import { Disclosure } from '@headlessui/react';

export default function FilterResultPanel({
  children,
  label,
  isOpen = false,
}: {
  children: ReactNode;
  label: any;
  isOpen?: boolean;
}) {
  return (
    <Disclosure defaultOpen={isOpen}>
      {({ open }) => (
        <>
          <Disclosure.Button className="flex items-center justify-center w-full gap-2 px-2 py-3 font-bold text-left text-gray-700 border-t-2 border-gray-700 shrink-0 text-md hover:bg-gray-200 focus:outline-none focus-visible:ring focus-visible:ring-gray-500 focus-visible:ring-opacity-75">
            {label}
            <ChevronUpIcon
              className={`${
                open ? 'rotate-180 transform' : 'rotate-90'
              } ml-auto h-5 w-5 transition`}
            />
          </Disclosure.Button>
          <Disclosure.Panel className="h-full p-3 overflow-y-auto text-gray-500 min-h-2 shrink scroll-child">
            {children}
          </Disclosure.Panel>
        </>
      )}
    </Disclosure>
  );
}
