import { createClient } from '@supabase/supabase-js';

export const createAdminClient = () => {
  const serviceRoleKey = process.env.SUPABASE_PRIVATE_KEY;

  // Add this console.log to debug
  console.log('Available env vars:', {
    hasKey: !!process.env.SUPABASE_PRIVATE_KEY,
    url: process.env.NEXT_PUBLIC_SUPABASE_URL,
  });

  if (!serviceRoleKey) {
    throw new Error('SUPABASE_PRIVATE_KEY is not defined');
  }

  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_PRIVATE_KEY!, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
};
