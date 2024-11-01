"use server";

import { DbProfile } from "@/types";
import { DbUser } from "@/types";
import { dbUserToUserWithProfile } from "@/types/type-utils";
import { createClient } from "@/utils/supabase/server";

export async function login(username: string, password: string) {
  const client = createClient();

  const { data, error } = await client.auth.signInWithPassword({
    email: username,
    password: password,
  });

  if (error) {
    return { error: error.message };
  }

  // find the profile for the user
  const { data: profileData, error: profileError } = await client
    .from("profiles")
    .select("*")
    .eq("id", data?.user?.id)
    .single();

  if (profileError) {
    return { error: profileError.message };
  }

  const userWithProfile = dbUserToUserWithProfile(
    data?.user as unknown as DbUser,
    profileData as unknown as DbProfile
  );

  return { data: userWithProfile, error: null };
}
