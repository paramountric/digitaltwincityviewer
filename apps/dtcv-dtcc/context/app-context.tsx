"use client";

import { UserWithProfile, Project, projectToEntity } from "@/model";
import { Feature } from "@/viewport";
import React, {
  createContext,
  useState,
  useContext,
  ReactNode,
  useRef,
  useEffect,
} from "react";
import { Viewport, ViewportProps } from "@/viewport";

interface AppContextType {
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
  viewport: Viewport | null;
  user: UserWithProfile | null;
  setUser: (user: UserWithProfile | null) => void;
  project: Project | null;
  setProject: (project: Project | null) => void;
  updateProject: (project: Project) => void;
  projects: Project[];
  setProjects: (projects: Project[]) => void;
  features: Feature[];
  setFeatures: (features: Feature[]) => void;
  theme: "light" | "dark";
  toggleTheme: () => void;
  activeDialogId: string | null;
  setActiveDialogId: (id: string | null) => void;
  showLeftSidebar: boolean;
  setShowLeftSidebar: (show: boolean) => void;
  showRightSidebar: boolean;
  setShowRightSidebar: (show: boolean) => void;
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
  const [mainFeature, _setMainFeature] = useState<Feature | null>(
    project ? projectToEntity(project) : null
  );
  const [features, _setFeatures] = useState<Feature[]>(initial.features);
  const [activeDialogId, setActiveDialogId] = useState<string | null>(null);
  const [showLeftSidebar, setShowLeftSidebar] = useState<boolean>(true);
  const [showRightSidebar, setShowRightSidebar] = useState<boolean>(false);
  const [theme, setTheme] = useState<"light" | "dark">("dark");

  const setUser = (user: UserWithProfile | null) => {
    _setUser(user);
  };

  const setProject = (project: Project | null) => {
    console.log("todo: reset state here for the features etc");
    _setProject(project);
  };

  const updateProject = (project: Project) => {
    _setProject((prevProject) => {
      if (!prevProject) return project;
      return {
        ...prevProject,
        properties: project.properties,
      };
    });
  };

  const setProjects = (projects: Project[]) => {
    _setProjects(projects);
  };

  const setFeatures = (features: Feature[]) => {
    _setFeatures(features);
  };

  const updateCanvasSize = () => {
    if (viewportRef.current && canvasRef.current) {
      const { offsetWidth, offsetHeight } = canvasRef.current.parentElement!;
      viewportRef.current.updateCanvasSize(offsetWidth, offsetHeight);
    }
  };

  const handleViewportOnLoad = () => {
    console.log("viewport loaded");
    window.addEventListener("resize", updateCanvasSize);
    // todo: add more event listeners here, on canvas (unmount them in return statement of the useEffect)
  };

  useEffect(() => {
    if (viewportRef.current) {
      viewportRef.current.applyFeatures(features);
      viewportRef.current.setMainViewState({
        zoom: -1,
        rotationOrbit: 0,
        rotationX: 45,
      });
    }
  }, [features]);

  useEffect(() => {
    if (canvasRef.current && !viewportRef.current) {
      const {
        offsetWidth = window.innerWidth,
        offsetHeight = window.innerHeight,
      } = canvasRef.current.parentElement!;

      const viewportFeature = mainFeature ? mainFeature : undefined;
      const viewportProps: ViewportProps = {
        canvas: canvasRef.current,
        width: offsetWidth,
        height: offsetHeight,
        mainFeature: viewportFeature,
        onLoad: handleViewportOnLoad,
      };
      viewportRef.current = new Viewport(viewportProps);
    }

    return () => {
      if (viewportRef.current?.deck) {
        window.removeEventListener("resize", updateCanvasSize);
        // viewportRef.current?.dispose();
      }
    };
  }, [canvasRef.current]);

  const toggleTheme = () => {
    setTheme((prevTheme) => (prevTheme === "light" ? "dark" : "light"));
  };

  const value: AppContextType = {
    canvasRef,
    viewport: viewportRef.current,
    user,
    project,
    setProject,
    setUser,
    projects,
    setProjects,
    features,
    setFeatures,
    updateProject,
    activeDialogId,
    setActiveDialogId,
    theme,
    toggleTheme,
    showLeftSidebar,
    setShowLeftSidebar,
    showRightSidebar,
    setShowRightSidebar,
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
