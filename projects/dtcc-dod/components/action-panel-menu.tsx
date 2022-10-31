import {ChevronDownIcon} from '@heroicons/react/20/solid';
import {Menu, Transition} from '@headlessui/react';
import {Fragment} from 'react';

type MenuOption = {
  key: string;
  label: string;
};

type ActionPanelMenuProps = {
  name: string;
  options: MenuOption[];
  selectedKey: string;
  onSelect: (key: string) => void;
};

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(' ');
}

const ActionPanelMenu: React.FC<ActionPanelMenuProps> = props => {
  return (
    <Menu as="div" className="relative inline-block text-left m-1">
      <div>
        <Menu.Button className="inline-flex w-full justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none">
          {props.name}
          <ChevronDownIcon className="-mr-1 ml-2 h-5 w-5" aria-hidden="true" />
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
        <Menu.Items className="absolute z-10 mt-2 origin-top-left rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
          <div className="py-1">
            {props.options.map(option => (
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

export default ActionPanelMenu;
