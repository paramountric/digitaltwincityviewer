import { useState, useEffect, useMemo } from 'react';
import getConfig from 'next/config';
import { Observable } from '../lib/Observable';
import { useUser } from './use-user';

export type Note = {
  id: string;
  comment: string;
  userId: string;
  userName: string;
  entityId: string;
  entityName: string;
  createdAt: string;
  center?: number[];
  elevation?: number;
};

const { publicRuntimeConfig } = getConfig();
const notesUrl = publicRuntimeConfig.notesUrl;

const noteListStore = new Observable<Note[]>([]);

export const useNotes = () => {
  const [noteList, setNoteList] = useState<Note[]>(noteListStore.get());
  const [isCached, setIsCached] = useState(false);
  const { state: user } = useUser();

  useEffect(() => {
    return noteListStore.subscribe(setNoteList);
  }, []);

  useEffect(() => {
    const fetchNotes = async () => {
      try {
        const notesRes = await fetch(notesUrl, {
          headers: {
            Authorization: `Bearer ${user.token}`,
          },
        });
        const notes = await notesRes.json();

        noteListStore.set(
          notes.map(
            (n: any) =>
              ({
                id: n._id,
                comment: n.comment,
                userId: n.userId,
                userName: n.userName,
                entityId: n.entityId,
                entityName: n.entityName,
                createdAt: n.createdAt,
                center: n.center,
                elevation: n.elevation,
              } as Note)
          )
        );
      } catch (error) {
        console.error(error);
      }
    };
    if (user.token && !isCached) {
      fetchNotes();
      setIsCached(true);
    }
    return;
  }, [user.token]);

  const noteListActions = useMemo(() => {
    return {
      addNote: (note: Note) => {
        noteListStore.set([...noteListStore.get(), note]);
      },
      getFilteredNotes: (key: string, value: string) => {
        const notes = noteListStore.get();
        return notes.filter((note: any) => note[key] === value);
      },
    };
  }, [noteList]);

  return {
    actions: noteListActions,
    state: noteList,
  };
};
