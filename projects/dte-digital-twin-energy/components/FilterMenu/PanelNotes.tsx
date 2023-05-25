import { useState, useEffect, ChangeEvent } from 'react';
import {
  MapPinIcon,
  MagnifyingGlassIcon,
  PlusIcon,
} from '@heroicons/react/20/solid';
import { default as calculateCenter } from '@turf/center';
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
  const [search, setSearch] = useState('');
  const [showAddNewNote, setShowAddNewNote] = useState(false);

  useEffect(() => {
    if (userState.name) {
      setName(userState.name);
    }
  }, [userState]);

  const handleSendNote = () => {
    if (selectedFeature?.properties?.UUID && note) {
      const center = calculateCenter(selectedFeature);
      sendNote(
        selectedFeature.properties.UUID,
        selectedFeature.properties.addr || 'Unknown address',
        note,
        name,
        [center.geometry.coordinates[0], center.geometry.coordinates[1]],
        selectedFeature.properties.hgt
      );
      setNote('');
    }
  };

  function handleSearch(event: ChangeEvent<HTMLInputElement>) {
    const { value } = event.target;
    setSearch(value);
  }

  return (
    <div className=" max-w-prose">
      {/*Pins*/}
      <div>
        <ButtonSwitch
          label={uiState.showPins ? 'MAP PINS ON' : 'MAP PINS OFF'}
          actions={uiActions.setShowPins}
          state={uiState.showPins}
          size="small"
        />
      </div>

      {/*Search*/}
      <div>
        <div className="relative mt-4">
          <input
            type="text"
            value={search}
            onChange={handleSearch}
            placeholder="Search"
            className="block w-full py-3 text-gray-700 peer focus:outline-0"
          />
          <div
            className="absolute inset-x-0 bottom-0 border-t border-gray-500 "
            aria-hidden="true"
          />
          {/* <MagnifyingGlassIcon className="absolute w-5 h-5 text-gray-300 top-1/2 peer-focus:hidden" /> */}
        </div>
      </div>

      {/*Notes*/}
      <ul role="list" className="w-full divide-y divide-gray-100">
        {notesListState.map((note) => (
          <li
            key={note.id}
            className="flex justify-between py-5 text-gray-900 gap-x-6"
          >
            <div className="flex w-full gap-x-4">
              <div className="flex-auto">
                <div className="flex items-center justify-between">
                  <p className="font-bold text-normal ">{note.userName}</p>
                  <p className="text-xs text-gray-500 capitalize">
                    <time dateTime={note.createdAt}>
                      {formatDate(note.createdAt)}
                    </time>
                  </p>
                </div>
                <p className="flex items-center gap-1 text-xs text-gray-500 truncate">
                  <MapPinIcon className="w-2 h-2" />
                  {note.entityName}
                </p>
                <p className="mt-3 text-sm ">{note.comment}</p>
              </div>
            </div>
          </li>
        ))}
      </ul>

      {/*Post note*/}
      <div className="mt-8">
        {showAddNewNote ? (
          <div className="border-t-2 border-gray-700">
            <p className="flex my-4 text-sm text-gray-600">
              <MapPinIcon className="w-6 h-6 mr-2" />
              {selectedFeature?.properties?.addr || (
                <span className="italic">Select a building on the screen</span>
              )}
            </p>

            <div className="mt-2">
              <div className="flex w-full rounded-md shadow-sm ring-1 ring-inset ring-gray-300 focus-within:ring-2 focus-within:ring-inset focus-within:ring-gray-600">
                <input
                  type="text"
                  name="name"
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  autoComplete="name"
                  className="block w-full border-0 bg-transparent py-1.5 px-2 text-gray-900 placeholder:text-gray-400 focus:ring-0 sm:text-sm"
                  placeholder="Your name"
                />
              </div>

              <div className="mt-3">
                <textarea
                  id="note"
                  name="note"
                  value={note}
                  placeholder="Your note"
                  onChange={(e) => setNote(e.target.value)}
                  rows={3}
                  className="block px-2 w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-gray-600 sm:text-sm"
                />
              </div>
            </div>

            <div className="flex w-full gap-8 my-4 mt-6">
              <p className="text-xs text-gray-600">
                By pressing send you acknowledge awareness that this note will
                be available to the public.
              </p>
              <div className="flex items-center gap-x-6">
                <button
                  onClick={() => setShowAddNewNote(false)}
                  type="button"
                  className="p-2 text-sm font-semibold text-gray-900"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!selectedFeature || !name || !note}
                  onClick={handleSendNote}
                  className="py-2 px-7 button-rounded hover:bg-lime-700"
                >
                  Send
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex justify-end w-full">
            <button
              className="button-rounded"
              onClick={() => setShowAddNewNote(true)}
            >
              <PlusIcon className="w-5 h-5" /> Add new note
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
