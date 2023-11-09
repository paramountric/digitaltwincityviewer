'use client';

import React from 'react';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { DndProvider } from 'react-dnd';
import Canvas from './Canvas';

export default function Viewport({ config }: any) {
  return (
    <DndProvider backend={HTML5Backend}>
      <div className="flex justify-center">
        <Canvas config={config} />
      </div>
    </DndProvider>
  );
}
