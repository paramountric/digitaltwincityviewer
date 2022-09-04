import {Fragment} from 'react';
import {Menu, Transition} from '@headlessui/react';
import {ChevronDownIcon} from '@heroicons/react/20/solid';
import {useIndicators} from '../hooks/indicators';
import {useProtectedData} from '../hooks/data';

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(' ');
}

type ActionPanelProps = {};
const ActionPanel: React.FC<ActionPanelProps> = () => {
  const {
    selectedYear,
    setSelectedYear,
    propertyKey,
    setPropertyKey,
    getPropertyLabel,
    propertyKeyOptions,
    yearOptions,
  } = useIndicators();
  const {scenarioKey, setScenarioKey, scenarioKeyOptions} = useProtectedData();

  return (
    <div className="absolute flex justify-center w-full top-16 z-20">
      <Menu as="div" className="relative inline-block text-left m-1">
        <div>
          <Menu.Button className="inline-flex w-full justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none">
            Indicators
            <ChevronDownIcon
              className="-mr-1 ml-2 h-5 w-5"
              aria-hidden="true"
            />
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
              {propertyKeyOptions.map(option => (
                <Menu.Item key={option.key}>
                  <a
                    href="#"
                    className={classNames(
                      option.key === propertyKey
                        ? 'bg-gray-100 text-gray-900'
                        : 'text-gray-700',
                      'block px-4 py-2 text-sm'
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
      <Menu as="div" className="relative inline-block text-left m-1">
        <div>
          <Menu.Button className="inline-flex w-full justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50">
            Year
            <ChevronDownIcon
              className="-mr-1 ml-2 h-5 w-5"
              aria-hidden="true"
            />
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
              {yearOptions.map(option => (
                <Menu.Item key={option}>
                  <a
                    href="#"
                    className={classNames(
                      option === selectedYear
                        ? 'bg-gray-100 text-gray-900'
                        : 'text-gray-700',
                      'block px-4 py-2 text-sm'
                    )}
                  >
                    {option}
                  </a>
                </Menu.Item>
              ))}
            </div>
          </Menu.Items>
        </Transition>
      </Menu>
      <Menu as="div" className="relative inline-block text-left m-1">
        <div>
          <Menu.Button className="inline-flex w-full justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none">
            Scenario
            <ChevronDownIcon
              className="-mr-1 ml-2 h-5 w-5"
              aria-hidden="true"
            />
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
              {scenarioKeyOptions.map(option => (
                <Menu.Item key={option.key}>
                  <a
                    href="#"
                    className={classNames(
                      option.key === scenarioKey
                        ? 'bg-gray-100 text-gray-900'
                        : 'text-gray-700',
                      'block px-4 py-2 text-sm'
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
    </div>
  );
};

{
  /* <div className="absolute top-16 z-10">
      <span>{getPropertyLabel()}</span>
      {propertyKeyOptions.map(option => (
        <button key={option.key} onClick={() => setPropertyKey(option.key)}>
          {option.label}
        </button>
      ))}

      <span>{selectedYear}</span>
      {yearOptions.map(option => (
        <button key={option} onClick={() => setSelectedYear(option)}>
          {option}
        </button>
      ))}
    </div> */
}

export default ActionPanel;
