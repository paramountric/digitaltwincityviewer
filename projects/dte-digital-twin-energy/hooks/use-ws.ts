import { useEffect, useRef, useState } from 'react';
import socketIOClient, { Socket } from 'socket.io-client';
import getConfig from 'next/config';
import { useUser } from './use-user';

const { publicRuntimeConfig } = getConfig();

const wsUrl = publicRuntimeConfig.wsUrl;

const NODES_EVENT = 'dte-notes';
const CURSOR_EVENT = 'dte-cursor';
const ROOM_ID = 'dte-demo';

export const useWs = () => {
  const socketRef = useRef<Socket | null>();
  const { state: user } = useUser();

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

    socketRef.current.on(NODES_EVENT, (notesData: any) => {
      console.log('incoming notesData', notesData);

      const note = notesData.body || {};
    });

    return () => {
      socketRef.current?.disconnect();
    };
  }, [user.token]);

  const sendNote = (featureId: string, note: string) => {
    if (!note || !featureId) {
      console.warn('missing required data');
    }
    if (!socketRef.current) {
      console.warn('no socket connected');
    }
    if (!user.token || !user.name) {
      console.warn('user is not ok');
    }
    const noteData = {
      userId: user.id,
      userName: user.name,
      featureId,
      note,
    };
    console.log('sendNote', noteData);
    socketRef.current.emit(NODES_EVENT, {
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
    socketRef.current.emit(CURSOR_EVENT, {
      ROOM_ID,
      body: cursorData,
      userId: user.id,
    });
  };

  return { sendNote };
};
