"use client";

import { Suspense } from "react";
import Spinner from "@/components/ui/spinner";
import Navigation from "../../_components/navigation";
import LoginForm from "../../_components/login-form";
import { Canvas } from "../../_components/canvas";
import { useAppContext } from "@/context/app-context";

export default function ProjectPage() {
  const { user } = useAppContext();

  return (
    <>
      <Suspense
        fallback={
          <div className="flex items-center justify-center min-h-screen">
            <Spinner />
          </div>
        }
      >
        <div className="absolute z-50 top-0 left-0 w-full h-full bg-transparent text-black dark:text-white pointer-events-none">
          {user ? (
            <Navigation />
          ) : (
            <div className="flex items-center justify-center h-full">
              <LoginForm />
            </div>
          )}
        </div>
      </Suspense>
      <div className="relative h-screen overflow-hidden">
        <Canvas />
      </div>
    </>
  );
}
