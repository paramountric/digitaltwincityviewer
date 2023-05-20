import { useEffect, useRef, useState } from 'react';
import socketIOClient, { Socket } from 'socket.io-client';
import getConfig from 'next/config';
import { useUser } from './use-user';
import { Note, useNotes } from './use-notes';

const { publicRuntimeConfig } = getConfig();

const wsUrl = publicRuntimeConfig.wsUrl;

const NOTES_EVENT = 'comments';
const CURSOR_EVENT = 'dte-cursor';
const ROOM_ID = 'dte-demo';

export const useWs = () => {
  const socketRef = useRef<Socket | null>();
  const { state: user } = useUser();
  const { actions: noteListActions } = useNotes();

  useEffect(() => {
    if (!ROOM_ID || !user.token) {
      return;
    }
    socketRef.current = socketIOClient(wsUrl, {
      auth: {
        token: user.token,
      },
    });

    socketRef.current.emit('joinRoom', ROOM_ID);

    socketRef.current.on(NOTES_EVENT, (noteData: any) => {
      console.log('incoming noteData', noteData);
      if (!noteData) {
        return;
      }
      const {
        comment,
        userId,
        userName,
        entityId,
        entityName,
        createdAt,
        _id,
      } = noteData;

      const note: Note = {
        id: _id,
        comment,
        createdAt,
        userId,
        userName,
        entityId,
        entityName,
      };

      noteListActions.addNote?.(note);
    });

    return () => {
      socketRef.current?.disconnect();
    };
  }, [user.token]);

  // userName can be sent in if the user wants another name than in session
  const sendNote = (
    featureUUID: string,
    featureName: string,
    comment: string,
    userName?: string
  ) => {
    if (!comment || !featureUUID || !featureName) {
      console.warn('missing required data');
      return;
    }
    if (!socketRef.current) {
      console.warn('no socket connected');
      return;
    }
    if (!user.token || !user.name) {
      console.warn('user is not ok');
      return;
    }
    const noteData = {
      userName: userName || user.name,
      entityId: featureUUID,
      entityName: featureName,
      comment,
    };
    console.log('sendNote', noteData);
    socketRef.current.emit(NOTES_EVENT, {
      ROOM_ID,
      body: noteData,
      userId: user.id,
    });
  };

  const sendCursor = (lon: number, lat: number) => {
    if (!socketRef.current) {
      console.warn('no socket connected');
    }
    if (!user.token || !user.name) {
      console.warn('user is not ok');
    }
    const cursorData = {
      userId: user.id,
      userInitials: user.initials,
      lon,
      lat,
    };
    console.log('sendCursor', cursorData);
    socketRef.current?.emit(CURSOR_EVENT, {
      ROOM_ID,
      body: cursorData,
      userId: user.id,
    });
  };

  return { sendNote };
};
