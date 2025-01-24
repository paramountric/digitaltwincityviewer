'use server';

import { createClient } from '@/utils/supabase/server';

const SERVICES = {
  speckle: process.env.SPECKLE_URL || 'http://localhost:54330',
  n8n: process.env.N8N_URL || 'http://localhost:5678',
} as const;

// const N8N_EMAIL = process.env.N8N_EMAIL || 'admin@digitaltwincityviewer.com';
// const N8N_PASSWORD = process.env.N8N_PASSWORD || 'Very_secret_password_1234567890';

export async function signup(
  email: string,
  password: string,
  userData: {
    name?: string;
    emailRedirectTo?: string;
  }
) {
  const name = userData.name || email.split('@')[0];

  try {
    const registerUrl = new URL(`${SERVICES.speckle}/auth/local/register`);
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

    // if (speckleResponse.redirected) {
    //   const redirectUrl = new URL(speckleResponse.url);
    //   const accessCode = redirectUrl.searchParams.get('access_code');
    //   console.log('Speckle access code:', accessCode);
    // }

    const client = createClient();
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

    // const n8nSetupResponse = await fetch(`${SERVICES.n8n}/rest/owner/setup`, {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify({
    //     email: N8N_EMAIL,
    //     password: N8N_PASSWORD,
    //     firstName: 'ADMIN',
    //     lastName: 'USER',
    //   }),
    // });

    // if (!n8nSetupResponse.ok) {
    //   const errorText = await n8nSetupResponse.text();
    //   console.error('n8n setup failed:', errorText);
    //   return { error: `n8n setup failed: ${errorText}` };
    // }

    // const authCookie = n8nSetupResponse.headers.get('set-cookie');
    // if (!authCookie) {
    //   return { error: 'Failed to get n8n authentication token' };
    // }

    // const surveyResponse = await fetch(`${SERVICES.n8n}/rest/me/survey`, {
    //   method: 'POST',
    //   headers: {
    //     'Content-Type': 'application/json',
    //     Cookie: authCookie,
    //   },
    //   body: JSON.stringify({
    //     personalizationAnswers: {
    //       codingSkill: 'none',
    //       companySize: 'none',
    //       companyRole: 'none',
    //       nodeTypes: [],
    //       automationGoal: '',
    //       otherGoals: [],
    //       email: false,
    //       firstName: name,
    //       lastName: name,
    //     },
    //     version: 'v4',
    //     personalization_survey_submitted_at: new Date().toISOString(),
    //     personalization_survey_n8n_version: '1.0.0',
    //   }),
    // });

    // if (!surveyResponse.ok) {
    //   console.error('n8n survey submission failed:', await surveyResponse.text());
    //   return { error: 'n8n setup completion failed' };
    // }

    return {
      data: { email },
      error: null,
    };
  } catch (error) {
    console.error('Signup error:', error);
    return { error: 'Registration failed' };
  }
}
