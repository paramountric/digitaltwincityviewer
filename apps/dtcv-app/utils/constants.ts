export const SERVICES = {
  speckle: process.env.NEXT_PUBLIC_SPECKLE_URL || 'http://localhost:8080',
  n8n: process.env.NEXT_PUBLIC_N8N_URL || 'http://localhost:5678',
  supabase: process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://localhost:54321',
  dtcc: process.env.NEXT_PUBLIC_DTCC_URL || 'http://localhost:8001',
} as const;
