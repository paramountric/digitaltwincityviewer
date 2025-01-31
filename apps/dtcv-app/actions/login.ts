'use server';

import { DbProfile, DbUser, dbUserToUserWithProfile } from '@/model';
import { createClient } from '@/utils/supabase/server';
import { SERVICES } from '@/utils/constants';

export async function login(email: string, password: string) {
  try {
    // 1. Authenticate with Supabase
    const client = await createClient();
    const { data, error } = await client.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      return { error: error.message };
    }

    console.log('data:', data);

    // 2. Authenticate with Speckle
    const speckleResponse = await fetch(`${SERVICES.speckle}/auth/local/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    if (!speckleResponse.ok) {
      console.error('Speckle authentication failed:', speckleResponse);
      return { error: 'Speckle authentication failed' };
    }

    console.log('Speckle response:', speckleResponse);

    return {
      data,
      error: null,
    };
  } catch (error) {
    console.error('Login error:', error);
    return { error: 'Authentication failed' };
  }
}
