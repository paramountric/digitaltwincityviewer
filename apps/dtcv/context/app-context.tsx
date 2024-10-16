"use client";

import { UserWithProfile, Project } from "@/types";
import { Feature } from "@dtcv/viewport";
import React, {
  createContext,
  useState,
  useContext,
  ReactNode,
  useRef,
  useEffect,
} from "react";
import { Viewport, ViewportProps } from "@dtcv/viewport";

interface AppContextType {
  canvasRef: React.RefObject<HTMLCanvasElement>;
  viewportRef: React.RefObject<any>;
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
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const viewportRef = useRef<any | null>(null);

  const [user, _setUser] = useState<UserWithProfile | null>(initial.user);
  const [project, _setProject] = useState<Project | null>(initial.project);
  const [projects, _setProjects] = useState<Project[]>(initial.projects);
  const [features, _setFeatures] = useState<Feature[]>(initial.features);

  const [theme, setTheme] = useState<"light" | "dark">("light");

  const updateCanvasSize = () => {
    if (viewportRef.current && canvasRef.current) {
      const { offsetWidth, offsetHeight } = canvasRef.current.parentElement!;
      canvasRef.current.style.width = `${offsetWidth}px`;
      canvasRef.current.style.height = `${offsetHeight}px`;
      viewportRef.current.props.width = offsetWidth;
      viewportRef.current.props.height = offsetHeight;
      viewportRef.current.update();
    }
  };

  const handleViewportOnLoad = () => {
    console.log("viewport loaded");
    updateCanvasSize();
    window.addEventListener("resize", updateCanvasSize);
  };

  useEffect(() => {
    if (canvasRef.current && !viewportRef.current) {
      const { offsetWidth, offsetHeight } = canvasRef.current.parentElement!;
      console.log("offsetWidth", offsetWidth);
      console.log("offsetHeight", offsetHeight);
      const viewportProps: ViewportProps = {
        width: offsetWidth,
        height: offsetHeight,
        onLoad: handleViewportOnLoad,
      };
      viewportRef.current = new Viewport(viewportProps);
    }

    return () => {
      if (viewportRef.current?.deck) {
        window.removeEventListener("resize", updateCanvasSize);
        viewportRef.current?.dispose();
      }
    };
  }, [canvasRef.current]);

  const toggleTheme = () => {
    setTheme((prevTheme) => (prevTheme === "light" ? "dark" : "light"));
  };

  const value: AppContextType = {
    canvasRef,
    viewportRef,
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
