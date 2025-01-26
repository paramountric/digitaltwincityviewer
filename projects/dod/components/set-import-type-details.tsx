import { ChangeEvent, useState } from 'react';
import { ExclamationCircleIcon } from '@heroicons/react/20/solid';
import { Switch } from '@headlessui/react';

export type ImportTypeDetails = {
  name: string;
  description: string;
  saveToStream: boolean;
};

type ImportTypeDetailsProps = {
  fileName: string | null;
  onSetImportTypeDetails: (importTypeDetails: ImportTypeDetails) => void;
};

function classNames(...classes: any[]) {
  return classes.filter(Boolean).join(' ');
}

export default function SetImportTypeDetails(props: ImportTypeDetailsProps) {
  const [name, setName] = useState<string>(props.fileName || '');
  const [description, setDescription] = useState<string>('');
  const [saveToStream, setSaveToStream] = useState(false);

  const setImportTypeDetails = (key: string, value: any) => {
    switch (key) {
      case 'name':
        setName(value);
        props.onSetImportTypeDetails({
          name: value,
          description,
          saveToStream,
        });
        break;
      case 'description':
        setDescription(value);
        props.onSetImportTypeDetails({
          name,
          description: value,
          saveToStream,
        });
        break;
      case 'saveToStream':
        setSaveToStream(value);
        props.onSetImportTypeDetails({
          name,
          description,
          saveToStream: value,
        });
        break;
      default:
    }
  };

  return (
    <div className="flex flex-col mt-8 space-y-8 md:max-w-md mx-auto">
      <div>
        <div className="flex justify-between">
          <label
            htmlFor="email"
            className="block text-sm font-medium text-gray-700"
          >
            Type name
          </label>
          <span className="text-sm text-gray-500" id="type-name"></span>
        </div>
        <div className="mt-1 relative shadow-sm">
          <input
            type="text"
            name="type-name"
            id="type-name"
            onChange={e => setImportTypeDetails('name', e.target.value)}
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-400 focus:ring-blue-400 sm:text-sm"
            aria-describedby="type-name"
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
            This string should be put as value on an objects type key to enable
            validation
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
            onChange={e => setImportTypeDetails('description', e.target.value)}
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-400 focus:ring-blue-400 sm:text-sm"
            defaultValue={''}
          />
        </div>
      </div>
      <div>
        <Switch.Group as="div" className="flex items-center">
          <Switch
            checked={saveToStream}
            onChange={() => setImportTypeDetails('saveToStream', !saveToStream)}
            className={classNames(
              saveToStream ? 'bg-blue-400' : 'bg-gray-200',
              'relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none'
            )}
          >
            <span
              aria-hidden="true"
              className={classNames(
                saveToStream ? 'translate-x-5' : 'translate-x-0',
                'pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out'
              )}
            />
          </Switch>
          <Switch.Label as="span" className="ml-3">
            <span className="text-sm font-medium text-gray-900">
              Save to the Speckle stream
            </span>
            &nbsp;
            <span className="text-sm text-gray-500">
              (a &quot;types&quot; branch will be created if not exists. If this
              option is unselected the type will be lost when the page reloads.)
            </span>
          </Switch.Label>
        </Switch.Group>
      </div>
    </div>
  );
}
