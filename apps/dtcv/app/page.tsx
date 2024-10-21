"use client";

import { Suspense } from "react";
import { useAppContext } from "../context/app-context";
import { Canvas } from "./_components/canvas";
import LoginForm from "./_components/login-form";
import Spinner from "@/components/ui/spinner";

export default function Start() {
  const { user, project, projects, features } = useAppContext();

  return (
    <>
      <Suspense
        fallback={
          <div className="flex items-center justify-center min-h-screen">
            <Spinner />
          </div>
        }
      >
        <div className="absolute z-50 top-0 left-0 w-full h-full bg-transparent text-black dark:text-white">
          {user ? (
            "Logged in"
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
