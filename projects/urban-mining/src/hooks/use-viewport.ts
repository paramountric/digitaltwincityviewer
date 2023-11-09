import { useState, useLayoutEffect, useMemo } from 'react';
import { Viewer, ViewerProps } from '@dtcv/viewer';
import { Observable } from '../lib/observable';
import { CANVAS_PARENT_ID } from '../components/Canvas';

type ViewportStore = {
  viewer?: Viewer;
};

const viewportStore = new Observable<ViewportStore>({
  viewer: undefined,
});

export const useViewport = (viewerProps: ViewerProps = {}) => {
  const [viewportState, setViewportState] = useState<ViewportStore>(
    viewportStore.get()
  );

  useLayoutEffect(() => {
    viewportStore.subscribe(setViewportState);
  }, []);

  const viewportActions = useMemo(() => {
    return {
      setViewport: async (viewer: Viewer) => {
        console.log('init viewport - should run only once');
        viewportStore.set({ viewer });
      },
      removeViewport: () => {
        const viewport = document.getElementById(CANVAS_PARENT_ID);
        if (viewport) {
          viewport.remove();
        }
        viewportStore.set({});
      },
    };
  }, [viewportState]);

  return { viewportState, viewportActions };
};
