import { useState, useEffect } from 'react';
import { Disclosure, Switch } from '@headlessui/react';
import { ChevronUpIcon, MapPinIcon } from '@heroicons/react/20/solid';
import { useUi } from '../../hooks/use-ui';
import ButtonSwitch from '../ButtonSwitch';
import { useSelectedFeature } from '../../hooks/use-selected-feature';
import { useUser } from '../../hooks/use-user';
import { useWs } from '../../hooks/use-ws';
import { useNotes } from '../../hooks/use-notes';

function formatDate(dateString: string) {
  const date = new Date(dateString);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const timeDiff = Math.abs(today.getTime() - date.getTime());
  const dayDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));

  if (timeDiff < 86400000) {
    // Less than 24 hours
    const hours = date.getHours();
    const minutes = date.getMinutes();
    return 'today at ' + formatTime(hours, minutes);
  } else if (timeDiff < 172800000) {
    // Less than 48 hours
    const hours = date.getHours();
    const minutes = date.getMinutes();
    return 'yesterday at ' + formatTime(hours, minutes);
  } else {
    const formattedDate = dayDiff + ' days ago';
    return formattedDate;
  }
}

function formatTime(hours: number, minutes: number) {
  const formattedHours = hours.toString().padStart(2, '0');
  const formattedMinutes = minutes.toString().padStart(2, '0');
  return formattedHours + ':' + formattedMinutes;
}

export default function PanelNotes() {
  const { state: uiState, actions: uiActions } = useUi();
  const { state: selectedFeature } = useSelectedFeature();
  const { state: userState } = useUser();
  const { state: notesListState } = useNotes();
  const { sendNote } = useWs();
  const [name, setName] = useState(userState.name || '');
  const [note, setNote] = useState('');

  useEffect(() => {
    if (userState.name) {
      setName(userState.name);
    }
  }, [userState]);

  const handleSendNote = () => {
    if (selectedFeature?.properties?.UUID && note) {
      sendNote(
        selectedFeature.properties.UUID,
        selectedFeature?.properties?.addr || 'Unknown address',
        note,
        name
      );
    }
  };

  return (
    <Disclosure>
      {({ open }) => (
        <>
          <Disclosure.Button className="flex w-full gap-2 p-2 mt-2 text-sm font-medium text-left text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 focus:outline-none focus-visible:ring focus-visible:ring-gray-500 focus-visible:ring-opacity-75">
            <span>Notes</span>
            <span>({notesListState.length})</span>

            <ChevronUpIcon
              className={`${
                open ? 'rotate-180 transform' : ''
              } ml-auto h-5 w-5`}
            />
          </Disclosure.Button>
          <Disclosure.Panel className="p-3 text-xs text-gray-500">
            <div>
              <ButtonSwitch
                label={'MAP PINS OFF'}
                actions={uiActions.setShowPins}
                state={uiState.showPins}
              />
            </div>
            <p className="flex my-4 text-sm leading-6 text-gray-600">
              <MapPinIcon className="w-6 h-6 mr-2" />{' '}
              {selectedFeature?.properties?.addr || (
                <span className="italic">Select a building on the screen</span>
              )}
            </p>

            <ul role="list" className="divide-y divide-gray-100">
              {notesListState.map(note => (
                <li key={note.id} className="flex justify-between gap-x-6 py-5">
                  <div className="flex gap-x-4">
                    <div className="min-w-0 flex-auto">
                      <p className="text-sm font-semibold leading-6 text-gray-900">
                        {note.userName}
                      </p>
                      <p className="mt-1 truncate text-xs leading-5 text-gray-500">
                        {note.entityName}
                      </p>
                    </div>
                  </div>
                  <div className="hidden sm:flex sm:flex-col sm:items-end">
                    <p className="mt-1 text-xs leading-5 text-gray-500">
                      <time dateTime={note.createdAt}>
                        {formatDate(note.createdAt)}
                      </time>
                    </p>
                  </div>
                </li>
              ))}
            </ul>

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
