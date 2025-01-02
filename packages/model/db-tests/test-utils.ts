import { withSupawright } from 'supawright';
import type { Database } from '../src/generated/db';
import dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  throw new Error('SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set');
}

export const test = withSupawright<Database, 'public'>(['public'], {
  supabase: {
    supabaseUrl,
    serviceRoleKey,
  },
  // postgresql://postgres:postgres@127.0.0.1:54322/postgres
  database: {
    host: '127.0.0.1',
    port: 54322,
    user: 'postgres',
    password: 'postgres',
    database: 'postgres',
  },
});
