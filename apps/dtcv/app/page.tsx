"use client";

import { useAppContext } from "../context/app-context";
import { Canvas } from "./_components/canvas";

export default function Start() {
  const { user, project, projects, features } = useAppContext();

  return (
    <div className="w-screen h-screen overflow-hidden">
      <div className="bg-white dark:bg-background text-black dark:text-white">
        TEst
      </div>
      <Canvas />
    </div>
  );
}
