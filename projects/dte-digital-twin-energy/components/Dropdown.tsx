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

const Dropdown: React.FC<DropdownProps> = (props) => {
  const { name, options, selectedKey, onSelect, roundedClass, checkIcon } =
    props;

  return (
    <Menu
      as="div"
      className={`text-left border border-gray-300 text-sm font-medium focus:outline-none ${
        checkIcon
          ? 'bg-gray-700 text-white hover:bg-gray-500'
          : 'bg-white text-gray-900 hover:bg-gray-50'
      } ${roundedClass && roundedClass}`}
    >
      <Menu.Button className={`inline-flex px-4 py-2`}>
        {checkIcon && <CheckIcon className="-ml-0.5 mr-2 h-5 w-5" />}
        {name}
        <ChevronDownIcon className="w-5 h-5 ml-2 -mr-1" aria-hidden="true" />
      </Menu.Button>

      <Transition
        as={Fragment}
        enter="transition ease-out duration-100"
        enterFrom="transform opacity-0 scale-95"
        enterTo="transform opacity-100 scale-100"
        leave="transition ease-in duration-75"
        leaveFrom="transform opacity-100 scale-100"
        leaveTo="transform opacity-0 scale-95"
      >
        <Menu.Items className="absolute z-[60] mt-2 origin-top-left bg-white !rounded-md shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
          <div className="py-1">
            {options.map((option) => (
              <Menu.Item key={option.key}>
                <a
                  href="#"
                  onClick={() => onSelect(option.key)}
                  className={`block px-4 py-2 text-sm hover:bg-gray-50 ${
                    option.key === selectedKey
                      ? 'bg-gray-100 text-gray-900'
                      : 'text-gray-700'
                  }`}
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
