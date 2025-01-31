'use client';

import { Suspense } from 'react';
import { useAppContext } from '../context/app-context';
import { Canvas } from './_components/canvas';
import LoginForm from './login/_components/login-form';
import Spinner from '@/components/ui/spinner';
import Viewport from './_components/viewport';

export default function Start() {
  // Note: we are using middleware in this case so this conditional UI will not be used
  // The user will be logged in if ending up here
  // This is here for reference
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
        {user ? (
          <div className="absolute z-50 top-0 left-0 w-full h-full bg-transparent text-black dark:text-white pointer-events-none">
            <Viewport />
          </div>
        ) : (
          <div className="absolute z-50 top-0 left-0 w-full h-full bg-transparent text-black dark:text-white">
            <div className="flex items-center justify-center h-full">
              <LoginForm />
            </div>
          </div>
        )}
      </Suspense>
      <div className="relative h-screen overflow-hidden">
        <Canvas />
      </div>
    </>
  );
}
