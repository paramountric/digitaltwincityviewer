import { useState, useEffect, useMemo } from 'react';
import { Observable } from '../lib/Observable';

export type Note = {
  comment: string;
};

const notesListStore = new Observable<Note[]>([]);

export const useNotesList = () => {
  const [notesListState, setEntityState] = useState<Note[]>(
    notesListStore.get()
  );

  useEffect(() => {
    return notesListStore.subscribe(setEntityState);
  }, []);

  const notesListActions = useMemo(() => {
    return {
      addNote: (note: Note) => {
        notesListStore.set([...notesListStore.get(), note]);
      },
    };
  }, []);

  return {
    actions: notesListActions,
    state: notesListState,
  };
};
