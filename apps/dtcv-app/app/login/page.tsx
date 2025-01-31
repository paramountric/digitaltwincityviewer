'use client';

import { Suspense } from 'react';
import LoginForm from './_components/login-form';
import Spinner from '@/components/ui/spinner';
import { Canvas } from '../_components/canvas';

export default function Login() {
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
          <div className="flex items-center justify-center h-full">
            <LoginForm />
          </div>
        </div>
      </Suspense>
      <div className="relative h-screen overflow-hidden">
        <Canvas />
      </div>
    </>
  );
}
