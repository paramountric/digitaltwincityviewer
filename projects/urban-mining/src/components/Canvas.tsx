'use client';

import { useLayoutEffect, useRef } from 'react';
import { Viewer, ViewerProps } from '@dtcv/viewer';
import { useViewport } from '../hooks/use-viewport';
export const CANVAS_PARENT_ID = 'canvas';

const defaultViewportProps: ViewerProps = {};

export default function Canvas() {
  const containerRef = useRef<HTMLCanvasElement>(null);
  const {
    viewportActions: { setViewport },
    viewportState: { viewer },
  } = useViewport(defaultViewportProps);

  useLayoutEffect(() => {
    if (containerRef.current) {
      setViewport(
        new Viewer(
          Object.assign(defaultViewportProps, {
            canvas: containerRef.current,
          })
        )
      );
    }
  }, []);

  const handleContextMenu = (event: any) => {
    event.preventDefault();
  };

  return (
    <div className="fixed z-10 w-full h-full">
      <canvas
        id={CANVAS_PARENT_ID}
        style={{ width: '100%', height: '100vh' }}
        ref={containerRef}
        onContextMenu={handleContextMenu}
      />
    </div>
  );
}
