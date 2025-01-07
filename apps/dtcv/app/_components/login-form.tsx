'use client';

import React, { useState, useEffect } from 'react';
import { login } from '@/actions/login';
import { useRouter } from 'next/navigation';

const LoginForm: React.FC = () => {
  const router = useRouter();
  const [isMounted, setIsMounted] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    const { data, error } = await login(username, password);

    if (error) {
      setErrorMessage(error || 'Login failed. Please check your credentials.');
      return;
    }

    if (data) {
      // const route = data.profile.activeProjectId
      //   ? `/projects/${data.profile.activeProjectId}`
      //   : '/projects';

      // router.push(route);
      window.location.href = '/projects';
    }
  };

  if (!isMounted) {
    return null; // or return a loading skeleton
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white/30 p-8 rounded shadow-md">
      <h2 className="text-2xl mb-4 text-white">Sign in</h2>

      {errorMessage && (
        <div className="mb-4 p-3 bg-red-500/20 border border-red-500 rounded text-red-100 text-sm">
          {errorMessage}
        </div>
      )}

      <div className="mb-4">
        <label htmlFor="username" className="block text-white mb-2">
          Username
        </label>
        <input
          type="text"
          id="username"
          name="username"
          autoComplete="username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="w-full px-3 py-2 border rounded text-black"
          required
          suppressHydrationWarning
        />
      </div>
      <div className="mb-6">
        <label htmlFor="password" className="block text-white mb-2">
          Password
        </label>
        <input
          type="password"
          id="password"
          name="password"
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full px-3 py-2 border rounded text-black"
          required
          suppressHydrationWarning
        />
      </div>
      <button
        type="submit"
        className="w-full bg-secondary text-white py-2 px-4 rounded hover:bg-secondary/80"
      >
        Log In
      </button>
      <p className="text-white/50 text-sm mt-4 text-center">
        <a href="/signup" className="text-white/50 hover:underline">
          Don't have an account? Sign up
        </a>
      </p>
    </form>
  );
};

export default LoginForm;
