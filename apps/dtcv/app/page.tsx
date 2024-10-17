"use client";

import { useAppContext } from "../context/app-context";
import { Canvas } from "./_components/canvas";

export default function Start() {
  const { user, project, projects, features } = useAppContext();

  return (
    <>
      <div className="absolute top-0 left-0 w-full h-full bg-white dark:bg-background text-black dark:text-white">
        TEst
      </div>
      <div className="relative h-screen overflow-hidden">
        <Canvas />
      </div>
    </>
  );
}
