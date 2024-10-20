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
        emailRedirectTo: `${location.origin}/auth/callback`,
      },
    });

    if (error) {
      setError(error.message);
    } else {
      router.push("/auth/check-email");
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

              <button
                className="w-full p-3 mt-4 text-white bg-secondary border rounded-md shadow-md hover:shadow-lg hover:bg-opacity-90"
                disabled={loading}
                type="submit"
              >
                {loading ? (
                  <>
                    <svg
                      className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Creating account...
                  </>
                ) : (
                  "Create account"
                )}
              </button>
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
