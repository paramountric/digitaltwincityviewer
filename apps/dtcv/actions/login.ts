'use server';

import { DbProfile, DbUser, dbUserToUserWithProfile } from '@dtcv/model';
import { createClient } from '@/utils/supabase/server';

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
    .from('users')
    .select('*')
    .eq('suuid', data?.user?.id)
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
