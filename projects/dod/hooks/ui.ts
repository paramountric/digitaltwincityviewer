import { useState, useEffect, useMemo } from 'react';
import { Observable } from '../lib/Observable';

type LeftMenuPanel = 'add-data' | 'explore' | 'viewer';

export type UiStore = {
  showAddBaseDialog: boolean;
  showRightMenu: boolean;
  showLeftMenu: boolean;
  leftMenuPanel: LeftMenuPanel;
  showImportDataDialog: boolean;
  showEditTypeDialog: boolean;
  showImportTypeDialog: boolean;
  showTimelineX: boolean; // for the type of layout in timeline compoment
  showValidation: boolean;
  showTypeDialog: boolean;
  importTypeStreamId: string | null; // not the right place, maybe activeStream should be put somewhere
};

const uiStore = new Observable<UiStore>({
  showAddBaseDialog: false,
  showRightMenu: false,
  showLeftMenu: false,
  leftMenuPanel: 'explore',
  showImportDataDialog: false,
  showTimelineX: false,
  showValidation: true,
  showEditTypeDialog: false,
  showImportTypeDialog: false,
  showTypeDialog: false,
  importTypeStreamId: null,
});

export const useUi = () => {
  const [uiState, setUiState] = useState(uiStore.get());

  useEffect(() => {
    return uiStore.subscribe(setUiState);
  }, []);

  const actions = useMemo(() => {
    return {
      setShowAddBaseDialog: (showAddBaseDialog: boolean) =>
        uiStore.set({ ...uiState, showAddBaseDialog }),
      setShowRightMenu: (showRightMenu: boolean) =>
        uiStore.set({ ...uiState, showRightMenu }),
      setShowLeftMenu: (showLeftMenu: boolean) =>
        uiStore.set({ ...uiState, showLeftMenu }),
      setLeftMenuPanel: (leftMenuPanel: LeftMenuPanel) =>
        uiStore.set({ ...uiState, leftMenuPanel }),
      setShowImportDataDialog: (showImportDataDialog: boolean) =>
        uiStore.set({ ...uiState, showImportDataDialog }),
      setShowTimelineX: (showTimelineX: boolean) =>
        uiStore.set({ ...uiState, showTimelineX }),
      setShowValidation: (showValidation: boolean) =>
        uiStore.set({ ...uiState, showValidation }),
      setShowEditTypeDialog: (showEditTypeDialog: boolean) =>
        uiStore.set({ ...uiState, showEditTypeDialog }),
      setShowTypeDialog: (showTypeDialog: boolean) =>
        uiStore.set({ ...uiState, showTypeDialog }),
      setShowImportTypeDialog: (
        showImportTypeDialog: boolean,
        importTypeStreamId: string | null
      ) =>
        uiStore.set({ ...uiState, showImportTypeDialog, importTypeStreamId }),
    };
  }, [uiState]);

  return {
    state: uiState,
    actions,
  };
};
