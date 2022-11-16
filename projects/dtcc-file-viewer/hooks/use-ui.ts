import {useState, useEffect, useMemo} from 'react';
import {Observable} from '../lib/Observable';

export type UiStore = {
  isLoading: boolean;
  showLoadCityDialog: boolean;
  showUploadFileDialog: boolean;
  showLayerDialog: boolean;
  showLeftPanel: boolean;
  showRightPanel: boolean;
};

const uiStore = new Observable<UiStore>({
  isLoading: false,
  showLoadCityDialog: false,
  showUploadFileDialog: false,
  showLayerDialog: false,
  showLeftPanel: true,
  showRightPanel: false,
});

export const useUi = () => {
  const [uiState, setUiState] = useState(uiStore.get());

  useEffect(() => {
    return uiStore.subscribe(setUiState);
  }, []);

  const actions = useMemo(() => {
    return {
      setIsLoading: (isLoading: boolean) =>
        uiStore.set({...uiState, isLoading}),
      setShowLoadCityDialog: (showLoadCityDialog: boolean) =>
        uiStore.set({...uiState, showLoadCityDialog}),
      setShowUploadFileDialog: (showUploadFileDialog: boolean) =>
        uiStore.set({...uiState, showUploadFileDialog}),
      setShowLayerDialog: (showLayerDialog: boolean) =>
        uiStore.set({...uiState, showLayerDialog}),
      setShowRightPanel: (showRightPanel: boolean) =>
        uiStore.set({...uiState, showRightPanel}),
      setShowLeftPanel: (showLeftPanel: boolean) =>
        uiStore.set({...uiState, showLeftPanel}),
    };
  }, [uiState]);

  return {
    state: uiState,
    actions,
  };
};
