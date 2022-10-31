import {useState, useEffect, useMemo} from 'react';
import {Observable} from '../lib/Observable';
import {Viewer} from '../lib/Viewer';

export type ViewerStore = {
  viewer: Viewer | null;
  isLoading: boolean;
};

const viewerStore = new Observable<ViewerStore>({
  viewer: null,
  isLoading: false,
});

export const useViewer = () => {
  const [viewerState, setViewerState] = useState(viewerStore.get());

  useEffect(() => {
    return viewerStore.subscribe(setViewerState);
  }, []);

  const viewerActions = useMemo(() => {
    return {
      initViewer: ref =>
        viewerStore.set({...viewerState, viewer: new Viewer(ref)}),
    };
  }, [viewerState]);

  // const render = () => {
  //   if (!viewerState.viewer) {
  //     return;
  //   }
  //   //viewer.setJson({});
  // };

  // useEffect(() => {
  //   render();
  // }, [viewerState.viewer]);

  return {
    viewerState,
    viewerActions,
  };
};
