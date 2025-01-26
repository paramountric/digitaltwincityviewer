import { useState } from 'react';
import { RadioGroup } from '@headlessui/react';
import { CheckCircleIcon } from '@heroicons/react/20/solid';

const baseTypes = [
  {
    id: 1,
    title: 'Building construction',
    description:
      'A new building to be constructed. For a construction project with several buildings, a "Site base" can be used first to group buildings',
    sources: 'IFC, Spreadsheet data',
  },
  {
    id: 2,
    title: 'Building renovation',
    description: 'An existing building to be renovated',
    sources: 'Drawings, In-app manual modeling',
  },
  {
    id: 3,
    title: 'District retrofit',
    description:
      'An existing district to be retrofitted with a combination of new and old buildings, and changes of the surroundings',
    sources: 'Shapefile, Geojson, IFC, Point cloud, Elevation',
  },
  {
    id: 4,
    title: 'Parametric wood building',
    description: 'Quick prototyping of wood-framed buildings',
    sources: 'In-app parametric modeling',
  },
  {
    id: 5,
    title: 'City',
    description:
      'Buildings, roads, land cover, water bodies, etc at large scale',
    sources: 'Shapefile, Geojson, CityGML',
  },
];

function classNames(...classes: any[]) {
  return classes.filter(Boolean).join(' ');
}

type SelectBaseTypeProps = {
  onSelectBaseType: (baseTypeId: number) => void;
};

export default function SelectBaseType(props: SelectBaseTypeProps) {
  const [selectedBaseType, setSelectedBaseType] = useState(baseTypes[0]);

  const selectBaseType = (e: any) => {
    props.onSelectBaseType(e.id);
    setSelectedBaseType(e);
  };

  return (
    <RadioGroup value={selectedBaseType} onChange={selectBaseType}>
      <RadioGroup.Label className="text-base font-medium text-gray-900">
        Select a mailing list
      </RadioGroup.Label>

      <div className="mt-4 grid grid-cols-1 gap-y-6 sm:grid-cols-3 sm:gap-x-4">
        {baseTypes.map(mailingList => (
          <RadioGroup.Option
            key={mailingList.id}
            value={mailingList}
            className={({ checked, active }) =>
              classNames(
                checked ? 'border-transparent' : 'border-gray-300',
                active ? 'border-blue-400 ring-2 ring-blue-400' : '',
                'relative flex cursor-pointer rounded-lg border bg-white p-4 shadow-sm focus:outline-none'
              )
            }
          >
            {({ checked, active }) => (
              <>
                <span className="flex flex-1">
                  <span className="flex flex-col">
                    <RadioGroup.Label
                      as="span"
                      className="block text-sm font-medium text-gray-900"
                    >
                      {mailingList.title}
                    </RadioGroup.Label>
                    <RadioGroup.Description
                      as="span"
                      className="mt-1 flex items-center text-sm text-gray-500"
                    >
                      {mailingList.description}
                    </RadioGroup.Description>
                    <RadioGroup.Description
                      as="span"
                      className="mt-6 text-sm font-medium text-gray-900"
                    >
                      Data sources: {mailingList.sources}
                    </RadioGroup.Description>
                  </span>
                </span>
                <CheckCircleIcon
                  className={classNames(
                    !checked ? 'invisible' : '',
                    'h-5 w-5 text-blue-600'
                  )}
                  aria-hidden="true"
                />
                <span
                  className={classNames(
                    active ? 'border' : 'border-2',
                    checked ? 'border-blue-400' : 'border-transparent',
                    'pointer-events-none absolute -inset-px rounded-lg'
                  )}
                  aria-hidden="true"
                />
              </>
            )}
          </RadioGroup.Option>
        ))}
      </div>
    </RadioGroup>
  );
}
