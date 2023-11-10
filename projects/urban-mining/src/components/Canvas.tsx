'use client';

import { Viewer, ViewerProps } from '@dtcv/viewer';
import { useRef, useLayoutEffect } from 'react';
import { useViewport } from '../hooks/use-viewport';
export const CANVAS_PARENT_ID = 'canvas';

export default function Canvas({ config }: { config: any }) {
  const containerRef = useRef<HTMLCanvasElement>(null);
  const defaultViewportProps: ViewerProps = {
    longitude: 11.981,
    latitude: 57.6717,
    zoom: 14,
    maxZoom: 21,
    minZoom: 10,
    backgroundColor: [0, 0, 255],
    mvtLayerConfig: {
      basemap: {
        id: 'basemap',
        data: config.mvtUrl,
      },
    },
    tile3dLayerConfig: {
      basemap3d: {
        id: 'basemap3d',
        data: config.tile3dUrl,
        loadOptions: {
          fetch: {
            headers: {
              'X-GOOG-API-KEY': config.googleApiKey,
            },
          },
        },
      },
    },
    // terrainLayerConfig: {
    //   basemapTerrain: {
    //     id: 'basemapTerrain',
    //     data: config.terrainUrl,
    //     texture: config.terrainTextureUrl,
    //   },
    // },
    defaultFeatureStates: {
      // mapbox
      landuse_overlay: {
        fillColor: [255, 0, 0],
        elevation: 0,
      },
      road: {
        fillColor: [255, 0, 0],
        elevation: 0,
      },
      poi_label: {
        fillColor: [255, 0, 0],
        elevation: 0,
      },
      structure: {
        fillColor: [255, 0, 0],
        elevation: 0,
      },
      transit_stop_label: {
        fillColor: [255, 0, 0],
        elevation: 0,
      },
      place_label: {
        fillColor: [255, 0, 0],
        elevation: 0,
      },
      natural_label: {
        fillColor: [255, 0, 0],
        elevation: 0,
      },
      airport_label: {
        fillColor: [255, 0, 0],
        elevation: 0,
      },
      motorway_junction: {
        fillColor: [255, 0, 0],
        elevation: 0,
      },
      // maptiler
      aerodrome_label: {
        fillColor: [255, 0, 0],
        elevation: 0,
      },
      aeroway: {
        fillColor: [255, 0, 0],
        elevation: 0,
      },
      boundary: {
        fillColor: [255, 0, 0],
        elevation: 0,
      },
      building: {
        fillColor: [255, 0, 0],
        strokeColor: [255, 255, 0],
        elevation: 10,
      },
      globallandcover: {
        fillColor: [0, 255, 0],
        elevation: 0,
      },
      housenumber: {
        fillColor: [255, 0, 0],
        elevation: 0,
      },
      landcover: {
        fillColor: [255, 0, 0],
        elevation: 0,
      },
      landuse: {
        fillColor: [255, 0, 0],
        elevation: 0,
      },
      mountain_peak: {
        fillColor: [255, 0, 0],
        elevation: 0,
      },
      park: {
        fillColor: [255, 0, 0],
        elevation: 0,
      },
      place: {
        fillColor: [255, 0, 0],
        elevation: 0,
      },
      poi: {
        fillColor: [255, 0, 0],
        elevation: 0,
      },
      transportation: {
        fillColor: [255, 0, 0],
        elevation: 0,
      },
      transportation_name: {
        fillColor: [255, 0, 0],
        elevation: 0,
      },
      water: {
        fillColor: [255, 0, 0],
        elevation: 0,
      },
      water_name: {
        fillColor: [255, 0, 0],
        elevation: 0,
      },
      waterway: {
        fillColor: [255, 0, 0],
        elevation: 0,
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
