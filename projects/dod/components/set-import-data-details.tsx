import { useState } from 'react';
import { ExclamationCircleIcon } from '@heroicons/react/20/solid';

export type ImportDataDetails = {
  name: string;
  description: string;
  longitude?: number | null;
  latitude?: number | null;
};

type ImportDataDetailsProps = {
  onSetImportDataDetails: (importDataDetails: ImportDataDetails) => void;
};

export default function SetImportDataDetails(props: ImportDataDetailsProps) {
  const [name, setName] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [longitude, setLongitude] = useState<number | null>(null);
  const [latitude, setLatitude] = useState<number | null>(null);

  const setImportDataDetails = (key: string, value: any) => {
    switch (key) {
      case 'name':
        setName(value);
        break;
      case 'description':
        setDescription(value);
        break;
      case 'longitude':
        setLongitude(value);
        break;
      case 'latitude':
        setLatitude(value);
        break;
      default:
    }
    props.onSetImportDataDetails({
      name,
      description,
      longitude,
      latitude,
    });
  };

  return (
    <div className="flex flex-col mt-8 space-y-8 md:max-w-md mx-auto">
      <div>
        <div className="flex justify-between">
          <label
            htmlFor="email"
            className="block text-sm font-medium text-gray-700"
          >
            Base name
          </label>
          <span className="text-sm text-gray-500" id="base-name"></span>
        </div>
        <div className="mt-1 relative shadow-sm">
          <input
            type="text"
            name="base-name"
            id="base-name"
            onChange={e => setImportDataDetails('name', e.target.value)}
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-400 focus:ring-blue-400 sm:text-sm"
            aria-describedby="base-name"
          />
          {name.length === 0 && (
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
              <ExclamationCircleIcon
                className="h-5 w-5 text-red-500"
                aria-hidden="true"
              />
            </div>
          )}
        </div>
        {name.length === 0 ? (
          <p className="mt-2 text-sm text-red-600" id="name-error">
            Name is mandatory
          </p>
        ) : (
          <p className="mt-2 text-sm text-gray-500" id="name-description">
            Help text
          </p>
        )}
      </div>
      <div>
        <div className="flex justify-between">
          <label
            htmlFor="description"
            className="block text-sm font-medium text-gray-700"
          >
            Description
          </label>
          <span className="text-sm text-gray-500" id="description-optional">
            Optional
          </span>
        </div>
        <div className="mt-1 shadow-sm">
          <textarea
            rows={4}
            name="description"
            id="description"
            onChange={e => setImportDataDetails('description', e.target.value)}
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-400 focus:ring-blue-400 sm:text-sm"
            defaultValue={''}
          />
        </div>
      </div>
      <div>
        <div className="flex justify-between">
          <label
            htmlFor="description"
            className="block text-sm font-medium text-gray-700"
          >
            Geographic position
          </label>
          <span className="text-sm text-gray-500" id="description-optional">
            Optional
          </span>
        </div>
      </div>
    </div>
  );
}
