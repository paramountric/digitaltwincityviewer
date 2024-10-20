"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Canvas } from "../_components/canvas";
import { createClient } from "@/utils/supabase/client";

export default function SignUp() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name: name,
        },
      },
    });

    if (error) {
      setError(error.message);
    } else {
      router.push("/login");
    }

    setLoading(false);
  };

  return (
    <>
      <div className="absolute z-50 top-0 left-0 w-full h-full bg-transparent text-black dark:text-white">
        <div className="flex items-center justify-center min-h-screen ">
          <div className="flex flex-col m-10">
            <h1 className="mb-5 text-3xl text-white">Sign up</h1>
            <form className="flex flex-col" onSubmit={handleSubmit}>
              <label>
                <span className="text-white">Name</span>
                <input
                  className="w-full p-2 border border-gray-400 rounded-md"
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </label>
              <label>
                <span className="text-white">Email</span>
                <input
                  className="w-full p-2 border border-gray-400 rounded-md"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </label>
              <label>
                <span className="text-white">Password</span>
                <input
                  className="w-full p-2 border border-gray-400 rounded-md"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </label>
              {error && <p className="text-red-600">{error}</p>}
              {loading ? (
                <p>Loading...</p>
              ) : (
                <button
                  className="w-full p-3 mt-4 text-white bg-secondary border rounded-md shadow-md hover:shadow-lg hover:bg-opacity-90"
                  type="submit"
                >
                  Sign Up
                </button>
              )}
            </form>
          </div>
        </div>
      </div>
      <div className="relative h-screen overflow-hidden">
        <Canvas />
      </div>
    </>
  );
}
