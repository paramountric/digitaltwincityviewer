import { Fragment } from 'react';
import { Menu, Transition } from '@headlessui/react';
import { CheckIcon } from '@heroicons/react/24/outline';
import { ChevronDownIcon } from '@heroicons/react/20/solid';

type MenuOption = {
  key: string;
  label: string;
};

type DropdownProps = {
  name: string;
  options: MenuOption[];
  selectedKey: string;
  onSelect: (key: string) => void;
  roundedClass?: 'rounded-l-md' | 'rounded-r-md' | 'rounded-md';
  checkIcon?: boolean;
};

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(' ');
}

const Dropdown: React.FC<DropdownProps> = (props) => {
  return (
    <Menu as="div" className="text-left">
      <div>
        <Menu.Button
          className={classNames(
            props.checkIcon
              ? 'bg-gray-700 text-white hover:bg-gray-500'
              : 'bg-white text-gray-900 hover:bg-gray-50',
            props.roundedClass || '',
            'inline-flex w-full justify-center border border-gray-300 px-4 py-2 text-sm font-medium shadow-sm focus:outline-none'
          )}
        >
          {props.checkIcon && <CheckIcon className="-ml-0.5 mr-2 h-5 w-5" />}
          {props.name}
          <ChevronDownIcon className="w-5 h-5 ml-2 -mr-1" aria-hidden="true" />
        </Menu.Button>
      </div>

      <Transition
        as={Fragment}
        enter="transition ease-out duration-100"
        enterFrom="transform opacity-0 scale-95"
        enterTo="transform opacity-100 scale-100"
        leave="transition ease-in duration-75"
        leaveFrom="transform opacity-100 scale-100"
        leaveTo="transform opacity-0 scale-95"
      >
        <Menu.Items className="absolute z-[60] mt-2 origin-top-left bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
          <div className="py-1">
            {props.options.map((option) => (
              <Menu.Item key={option.key}>
                <a
                  href="#"
                  onClick={() => props.onSelect(option.key)}
                  className={classNames(
                    option.key === props.selectedKey
                      ? 'bg-gray-100 text-gray-900'
                      : 'text-gray-700',
                    'block px-4 py-2 text-sm hover:bg-gray-50'
                  )}
                >
                  {option.label}
                </a>
              </Menu.Item>
            ))}
          </div>
        </Menu.Items>
      </Transition>
    </Menu>
  );
};

export default Dropdown;
