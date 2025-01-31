'use server';

import { SERVICES } from '@/utils/constants';
import { createClient } from '@/utils/supabase/server';

export async function signup(
  email: string,
  password: string,
  userData: {
    name?: string;
    emailRedirectTo?: string;
  }
) {
  const name = userData.name || email.split('@')[0];

  // this is showing the logic of connecting supabase and speckle user
  // speckle has the suuid column in the users table we can use
  // NOTE: you can create a migration file with function and trigger to do this automatically instead!

  try {
    const registerUrl = new URL(`${SERVICES.speckle}/authn/register`);
    registerUrl.searchParams.append('challenge', 'init_admin');

    const speckleResponse = await fetch(registerUrl.toString(), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      redirect: 'follow',
      body: JSON.stringify({
        email,
        password,
        name,
        company: '',
      }),
    });

    if (!speckleResponse.ok) {
      console.error('Speckle registration failed:', await speckleResponse.text());
      return { error: 'Speckle registration failed' };
    }

    const client = await createClient();

    const { data: supabaseData, error: supabaseError } = await client.auth.signUp({
      email,
      password,
      options: {
        data: { name },
        emailRedirectTo: userData.emailRedirectTo,
      },
    });

    if (supabaseError) {
      return { error: supabaseError.message };
    }

    // alter the suuid in the speckle users table
    const { data: speckleUser, error: speckleUserError } = await client
      .from('users')
      .update({ suuid: supabaseData.user?.id })
      .eq('id', supabaseData.user?.id);

    if (speckleUserError) {
      console.error('Error updating speckle user:', speckleUserError);
    }

    return {
      data: { email },
      error: null,
    };
  } catch (error) {
    console.error('Signup error:', error);
    return { error: 'Registration failed' };
  }
}
