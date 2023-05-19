import { Disclosure, Switch } from '@headlessui/react';
import { useEffect, useState } from 'react';
import { ChevronUpIcon } from '@heroicons/react/20/solid';
import { useUi } from '../../hooks/use-ui';
import { useSelectedFeature } from '../../hooks/use-selected-feature';
import { useUser } from '../../hooks/use-user';
import { useWs } from '../../hooks/use-ws';

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(' ');
}

export default function NotesPanel() {
  const { state: uiState, actions: uiActions } = useUi();
  const { state: selectedFeature } = useSelectedFeature();
  const { state: userState } = useUser();
  const { sendNote } = useWs();
  const [name, setName] = useState(userState.name || '');
  const [note, setNote] = useState('');

  useEffect(() => {
    if (userState.name) {
      setName(userState.name);
    }
  }, [userState]);

  const handleSendNote = () => {
    if (selectedFeature && note) {
      sendNote(selectedFeature.id, note);
    }
  };

  return (
    <Disclosure>
      {({ open }) => (
        <>
          <Disclosure.Button className="flex w-full gap-2 p-2 mt-2 text-sm font-medium text-left text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 focus:outline-none focus-visible:ring focus-visible:ring-gray-500 focus-visible:ring-opacity-75">
            <span>Notes</span>
            <span>(34)</span>

            <ChevronUpIcon
              className={`${
                open ? 'rotate-180 transform' : ''
              } ml-auto h-5 w-5`}
            />
          </Disclosure.Button>
          <Disclosure.Panel className="p-3 text-xs text-gray-500">
            <div>
              <Switch.Group as="div" className="flex items-center">
                <Switch
                  checked={uiState.showPins}
                  onChange={uiActions.setShowPins}
                  className={classNames(
                    uiState.showPins ? 'bg-gray-500' : '',
                    'relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ring-2 ring-gray-500'
                  )}
                >
                  <span
                    aria-hidden="true"
                    className={classNames(
                      uiState.showPins
                        ? 'translate-x-5 bg-gray-200'
                        : 'translate-x-0 bg-gray-500',
                      'pointer-events-none inline-block h-5 w-5 transform rounded-full shadow ring-0 transition duration-200 ease-in-out'
                    )}
                  />
                </Switch>
                <Switch.Label as="span" className="ml-3 text-xs">
                  <span className="font-medium text-gray-900">
                    MAP PINS OFF{' '}
                  </span>
                </Switch.Label>
              </Switch.Group>
            </div>
            <p className="mt-1 text-sm leading-6 text-gray-600">
              {selectedFeature?.address || 'Select a building on the screen'}
            </p>

            <div className="mt-2 grid grid-cols-1 gap-x-6 gap-y-4 sm:grid-cols-3">
              <div className="sm:col-span-full">
                <label
                  htmlFor="first-name"
                  className="block text-sm font-medium leading-6 text-gray-900"
                >
                  Name
                </label>
                <div className="mt-2">
                  <div className="flex rounded-md shadow-sm ring-1 ring-inset ring-gray-300 focus-within:ring-2 focus-within:ring-inset focus-within:ring-gray-600 sm:max-w-md">
                    <input
                      type="text"
                      name="name"
                      id="name"
                      value={name}
                      onChange={e => setName(e.target.value)}
                      autoComplete="name"
                      className="block flex-1 border-0 bg-transparent py-1.5 pl-1 text-gray-900 placeholder:text-gray-400 focus:ring-0 sm:text-sm sm:leading-6"
                      placeholder="Your name"
                    />
                  </div>
                </div>
              </div>

              <div className="col-span-full">
                <label
                  htmlFor="first-name"
                  className="block text-sm font-medium leading-6 text-gray-900"
                >
                  Note
                </label>
                <div>
                  <textarea
                    id="note"
                    name="note"
                    value={note}
                    placeholder="Your note"
                    onChange={e => setNote(e.target.value)}
                    rows={3}
                    className="block p-1 w-full max-w-xs rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-gray-600 sm:text-sm sm:leading-6"
                  />
                </div>
                <p className="mt-3 text-sm leading-6 text-gray-600">
                  By pressing send you acknowledge awareness that this note will
                  be available to the public.
                </p>
              </div>

              <div className="mt-6 flex items-center justify-end gap-x-6">
                <button
                  type="button"
                  className="text-sm font-semibold leading-6 text-gray-900"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!selectedFeature || !name || !note}
                  onClick={handleSendNote}
                  className="rounded-md bg-gray-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-gray-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-600"
                >
                  Send
                </button>
              </div>
            </div>
          </Disclosure.Panel>
        </>
      )}
    </Disclosure>
  );
}
