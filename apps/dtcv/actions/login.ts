"use server";

import { createClient } from "@/utils/supabase/server";

export async function login(username: string, password: string) {
  const client = createClient();

  const { data, error } = await client.auth.signInWithPassword({
    email: username,
    password: password,
  });

  return { data, error };
}
