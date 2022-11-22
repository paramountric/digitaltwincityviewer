import {useState, useEffect, useMemo} from 'react';
import {Observable} from '../lib/Observable';

export type UiStore = {
  isLoading: boolean;
  showCreateFlowDialog: boolean;
  showUploadFileDialog: boolean;
  showLayerDialog: boolean;
  showLeftPanel: boolean;
  showRightPanel: boolean;
};

const uiStore = new Observable<UiStore>({
  isLoading: false,
  showCreateFlowDialog: false,
  showUploadFileDialog: false,
  showLayerDialog: false,
  showLeftPanel: false,
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
      setShowCreateFlowDialog: (showCreateFlowDialog: boolean) =>
        uiStore.set({...uiState, showCreateFlowDialog}),
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
