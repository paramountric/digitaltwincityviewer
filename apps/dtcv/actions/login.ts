"use server";

import { createClient } from "@/utils/supabase/server";

export async function login(username: string, password: string) {
  const client = createClient();

  const { data, error } = await client.auth.signInWithPassword({
    email: username,
    password: password,
  });

  // Return a plain object with serializable data
  return {
    data: data
      ? {
          user: data.user
            ? {
                id: data.user.id,
                email: data.user.email,
                // Add other necessary user properties
              }
            : null,
          session: data.session
            ? {
                access_token: data.session.access_token,
                expires_at: data.session.expires_at,
                // Add other necessary session properties
              }
            : null,
        }
      : null,
    error: error
      ? {
          message: error.message,
          status: error.status,
        }
      : null,
  };
}
