import {Disclosure} from '@headlessui/react';
import {ChevronUpIcon} from '@heroicons/react/20/solid';

type BuildingFeatureGeneralDisplayProps = {};

const BuildingFeatureGeneralDisplay: React.FC<
  BuildingFeatureGeneralDisplayProps
> = props => {
  return (
    <Disclosure>
      {({open}) => (
        <>
          <Disclosure.Button className="flex w-full justify-between rounded-md py-2 text-left text-sm font-medium hover:bg-gray-50 focus:outline-none focus-visible:ring focus-visible:ring-gray-500 focus-visible:ring-opacity-75">
            <span>General</span>
            <ChevronUpIcon
              className={`${open ? 'rotate-180 transform' : ''} h-5 w-5`}
            />
          </Disclosure.Button>
          <Disclosure.Panel className="p-2 text-sm text-gray-500">
            Content
          </Disclosure.Panel>
        </>
      )}
    </Disclosure>
  );
};

export default BuildingFeatureGeneralDisplay;
