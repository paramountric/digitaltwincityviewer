"use client";

import { UserWithProfile, Project } from "@/app/types";
import { Feature } from "@/app/types";
import React, { createContext, useState, useContext, ReactNode } from "react";

interface AppContextType {
  user: UserWithProfile | null;
  project: Project | null;
  projects: Project[];
  features: Feature[];
  theme: "light" | "dark";
  toggleTheme: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

interface AppProviderProps {
  user: UserWithProfile | null;
  project: Project | null;
  projects: Project[];
  features: Feature[];
  children: ReactNode;
}

export const AppProvider: React.FC<AppProviderProps> = ({
  children,
  ...initial
}) => {
  const [user, _setUser] = useState<UserWithProfile | null>(initial.user);
  const [project, _setProject] = useState<Project | null>(initial.project);
  const [projects, _setProjects] = useState<Project[]>(initial.projects);
  const [features, _setFeatures] = useState<Feature[]>(initial.features);

  const [theme, setTheme] = useState<"light" | "dark">("light");

  const toggleTheme = () => {
    setTheme((prevTheme) => (prevTheme === "light" ? "dark" : "light"));
  };

  const value: AppContextType = {
    user,
    project,
    projects,
    features,

    theme,
    toggleTheme,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useAppContext = (): AppContextType => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useAppContext must be used within an AppProvider");
  }
  return context;
};
