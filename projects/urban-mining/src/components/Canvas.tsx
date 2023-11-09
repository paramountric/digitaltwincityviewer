'use client';

import { useLayoutEffect, useRef } from 'react';
import { Viewer, ViewerProps } from '@dtcv/viewer';
import { useViewport } from '../hooks/use-viewport';
export const CANVAS_PARENT_ID = 'canvas';

export default function Canvas({ config }: { config: any }) {
  const containerRef = useRef<HTMLCanvasElement>(null);
  const defaultViewportProps: ViewerProps = {
    longitude: 11.981,
    latitude: 57.6717,
    zoom: 14,
    mvtLayerConfig: {
      basemap: {
        id: 'basemap',
        data: `https://api.maptiler.com/tiles/v3/{z}/{x}/{y}.pbf?key=${config.maptilerApiKey}`,
      },
    },
    tile3dLayerConfig: {
      basemap3d: {
        id: 'basemap3d',
        data: `https://tile.googleapis.com/v1/3dtiles/root.json`,
        loadOptions: {
          fetch: {
            headers: {
              'X-GOOG-API-KEY': config.googleApiKey,
            },
          },
        },
      },
    },
    defaultFeatureStates: {
      building: {
        fillColor: [255, 0, 0],
        elevation: 10,
      },
    },
  };
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
