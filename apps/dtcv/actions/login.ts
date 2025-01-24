'use server';

import { DbProfile, DbUser, dbUserToUserWithProfile } from '@dtcv/model';
import { createClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers';

interface SpeckleAuthResponse {
  token: string;
  refreshToken: string;
}

interface N8nAuthResponse {
  token: string;
}

// const N8N_EMAIL = process.env.N8N_EMAIL || 'admin@digitaltwincityviewer.com';
// const N8N_PASSWORD = process.env.N8N_PASSWORD || 'Very_secret_password_1234567890';

const SERVICES = {
  speckle: process.env.SPECKLE_URL || 'http://localhost:54331',
  n8n: process.env.N8N_URL || 'http://localhost:5678',
} as const;

export async function login(username: string, password: string) {
  try {
    // 1. Authenticate with Supabase
    const client = createClient();
    const { data, error } = await client.auth.signInWithPassword({
      email: username,
      password: password,
    });

    if (error) {
      return { error: error.message };
    }

    console.log('data:', data);

    // 2. Get Speckle profile
    const { data: profileData, error: profileError } = await client
      .from('users')
      .select('*')
      .eq('suuid', data?.user?.id)
      .single();

    if (profileError) {
      console.error('Profile error:', profileError);
      return { error: profileError.message };
    }

    console.log('Profile data:', profileData);

    // 3. Authenticate with Speckle
    const speckleResponse = await fetch(`${SERVICES.speckle}/auth/local/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: username, password }),
    });

    if (!speckleResponse.ok) {
      console.error('Speckle authentication failed:', speckleResponse);
      return { error: 'Speckle authentication failed' };
    }

    console.log('Speckle response:', speckleResponse);

    const speckleData: SpeckleAuthResponse = await speckleResponse.json();
    const speckleCookies = speckleResponse.headers.get('set-cookie');

    // 4. Authenticate with n8n (do not use the admin n8n account here, that is only for the owner / admin person)
    // const n8nResponse = await fetch(`${SERVICES.n8n}/rest/login`, {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify({ email: N8N_EMAIL, password: N8N_PASSWORD }),
    // });

    // if (!n8nResponse.ok) {
    //   console.error('n8n authentication failed:', n8nResponse);
    //   return { error: 'n8n authentication failed' };
    // }

    // console.log('n8n response:', n8nResponse);

    // const n8nData: N8nAuthResponse = await n8nResponse.json();
    // const n8nCookies = n8nResponse.headers.get('set-cookie');

    // 5. Set cookies from both services
    const cookieStore = cookies();

    if (speckleCookies) {
      console.log('speckle cookies:', speckleCookies);
      speckleCookies.split(',').forEach((cookie) => {
        // Parse and set each cookie individually
        const [cookieName, ...rest] = cookie.split('=');
        cookieStore.set(cookieName.trim(), rest.join('='));
      });
    }

    // if (n8nCookies) {
    //   console.log('n8n cookies:', n8nCookies);
    //   n8nCookies.split(',').forEach((cookie) => {
    //     const [cookieName, ...rest] = cookie.split('=');
    //     cookieStore.set(cookieName.trim(), rest.join('='));
    //   });
    // }

    const userWithProfile = dbUserToUserWithProfile(
      data?.user as unknown as DbUser,
      profileData as unknown as DbProfile
    );

    console.log('userWithProfile:', userWithProfile);

    return {
      data: {
        ...userWithProfile,
        tokens: {
          speckle: speckleData.token,
          speckleRefresh: speckleData.refreshToken,
          // n8n: n8nData.token,
        },
      },
      error: null,
    };
  } catch (error) {
    console.error('Login error:', error);
    return { error: 'Authentication failed' };
  }
}
