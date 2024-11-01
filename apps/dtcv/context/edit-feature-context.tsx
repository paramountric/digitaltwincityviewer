"use client";

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useMemo,
} from "react";

interface EditFeatureContext {
  id: string; // This must be the real db id - not temporary id
  // todo: put all the properties here to expose them directly

  editFeatureErrors: Record<string, string>;
  clearErrors: () => void;

  // todo: add all the methods here
}

const EditFeatureContext = createContext<EditFeatureContext | undefined>(
  undefined
);

export const EditFeatureProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [errors, setErrors] = useState<Record<string, string>>({});

  const clearErrors = useCallback(() => {
    setErrors({});
  }, []);

  const contextValue = useMemo(
    () =>
      ({
        editFeatureErrors: errors,
        clearErrors,
      } as EditFeatureContext),
    [errors, clearErrors]
  );

  return (
    <EditFeatureContext.Provider value={contextValue}>
      {children}
    </EditFeatureContext.Provider>
  );
};

export const useEditFeature = () => {
  const context = useContext(EditFeatureContext);
  if (context === undefined) {
    throw new Error("useEditFeature must be used within a EditFeatureProvider");
  }
  return context;
};
