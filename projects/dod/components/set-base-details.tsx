import { useState } from 'react';
import { ExclamationCircleIcon } from '@heroicons/react/20/solid';

export type BaseDetails = {
  name: string;
  description: string;
  longitude?: number | null;
  latitude?: number | null;
};

type SetBaseDetailsProps = {
  onSetBaseDetails: (baseDetails: BaseDetails) => void;
  baseType: number;
};

export default function SetBaseDetails(props: SetBaseDetailsProps) {
  const [name, setName] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [longitude, setLongitude] = useState<number | null>(null);
  const [latitude, setLatitude] = useState<number | null>(null);
  const getHelpTextForName = () => {
    switch (props.baseType) {
      case 1:
        return 'Give your base a logical spatial name such as a place, address, location, factory name, etc';
      default:
        return 'Text';
    }
  };

  const setBaseDetails = (key: string, value: any) => {
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
    props.onSetBaseDetails({
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
            onChange={e => setBaseDetails('name', e.target.value)}
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
            {getHelpTextForName()}
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
            onChange={e => setBaseDetails('description', e.target.value)}
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
        <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
          <div className="sm:col-span-3">
            <label
              htmlFor="first-name"
              className="block text-sm font-medium text-gray-700"
            >
              Longitude
            </label>
            <div className="mt-1">
              <input
                type="number"
                min={-360}
                max={360}
                name="base-lon"
                id="base-lon"
                onChange={e => setBaseDetails('longitude', e.target.value)}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-400 focus:ring-blue-400 sm:text-sm"
                aria-describedby="base-lon"
              />
            </div>
          </div>

          <div className="sm:col-span-3">
            <label
              htmlFor="last-name"
              className="block text-sm font-medium text-gray-700"
            >
              Latitude
            </label>
            <div className="mt-1">
              <input
                type="number"
                min={-90}
                max={90}
                name="base-lat"
                id="base-lat"
                onChange={e => setBaseDetails('latitude', e.target.value)}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-400 focus:ring-blue-400 sm:text-sm"
                aria-describedby="base-lan"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
