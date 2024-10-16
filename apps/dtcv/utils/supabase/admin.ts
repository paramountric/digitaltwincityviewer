import { createClient } from '@supabase/supabase-js';

export const createAdminClient = () => {
  const serviceRoleKey = process.env.SUPABASE_PRIVATE_KEY;

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
