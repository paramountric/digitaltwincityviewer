import {useState, useEffect, useMemo} from 'react';
import {Observable} from '../lib/Observable';

/*
 * Most applications use some kind of application specific menus or panels
 * Call this store / hook to set the ui state
 */
export type UiStore = {
  isLoading: boolean;
  showLeftPanel: boolean;
  showRightPanel: boolean;
};

const uiStore = new Observable<UiStore>({
  isLoading: false,
  showLeftPanel: true,
  showRightPanel: false,
});

export const useUi = () => {
  const [state, setState] = useState(uiStore.get());

  useEffect(() => {
    return uiStore.subscribe(setState);
  }, []);

  const actions = useMemo(() => {
    return {
      setIsLoading: (isLoading: boolean) => uiStore.set({...state, isLoading}),
      setShowRightPanel: (showRightPanel: boolean) =>
        uiStore.set({...state, showRightPanel}),
      setShowLeftPanel: (showLeftPanel: boolean) =>
        uiStore.set({...state, showLeftPanel}),
    };
  }, [state]);

  return {
    state,
    actions,
  };
};
