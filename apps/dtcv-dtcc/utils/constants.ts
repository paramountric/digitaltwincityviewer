export const SERVICES = {
  speckle: process.env.SPECKLE_URL || 'http://localhost:8080',
  n8n: process.env.N8N_URL || 'http://localhost:5678',
  supabase: process.env.SUPABASE_URL || 'http://localhost:54321',
  dtcc: process.env.DTCC_URL || 'http://localhost:8000',
} as const;
