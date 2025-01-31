'use client';

import { createContext, useContext, useState, useCallback, useMemo, useEffect } from 'react';
import { useAppContext } from './app-context';
import { DrawPointMode, DrawLineStringMode, DrawPolygonMode, ViewMode } from '@/viewport';

interface InteractionContext {
  id: string; // This must be the real db id - not temporary id
  editMode: ViewMode | DrawPolygonMode | DrawPointMode | DrawLineStringMode;
  selectedFeatureIndexes: number[]; // required for the editable layer
  // todo: put all the properties here to expose them directly

  editFeatureErrors: Record<string, string>;
  clearErrors: () => void;
  setEditMode: (mode: ViewMode | DrawPolygonMode | DrawPointMode | DrawLineStringMode) => void;

  // todo: add all the methods here
}

const InteractionContext = createContext<InteractionContext | undefined>(undefined);

export const InteractionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { viewport } = useAppContext();
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [editMode, setEditMode] = useState<
    ViewMode | DrawPolygonMode | DrawPointMode | DrawLineStringMode
  >(new ViewMode());

  const clearErrors = useCallback(() => {
    setErrors({});
  }, []);

  // Use useMemo to derive interactionState from editMode
  const interactionState = useMemo(() => ({ editMode }), [editMode]);

  useEffect(() => {
    viewport?.setViewportInteractionState(interactionState);
  }, [interactionState, viewport]);

  const contextValue = useMemo(
    () =>
      ({
        editFeatureErrors: errors,
        clearErrors,
        editMode,
        setEditMode,
      } as InteractionContext),
    [errors, clearErrors, editMode]
  );

  return <InteractionContext.Provider value={contextValue}>{children}</InteractionContext.Provider>;
};

export const useInteraction = () => {
  const context = useContext(InteractionContext);
  if (context === undefined) {
    throw new Error('useInteraction must be used within a InteractionProvider');
  }
  return context;
};
