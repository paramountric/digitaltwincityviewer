import React, { useState } from "react";

const LoginForm: React.FC = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Add your login logic here
    console.log("Login attempt with:", username, password);
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white/30 p-8 rounded shadow-md">
      <h2 className="text-2xl mb-4 text-white">Login</h2>
      <div className="mb-4">
        <label htmlFor="username" className="block text-white mb-2">
          Username
        </label>
        <input
          type="text"
          id="username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="w-full px-3 py-2 border rounded text-white"
          required
        />
      </div>
      <div className="mb-6">
        <label htmlFor="password" className="block text-white mb-2">
          Password
        </label>
        <input
          type="password"
          id="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full px-3 py-2 border rounded text-white"
          required
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
