import { createClient } from '@supabase/supabase-js';

// Adicione SUPABASE_URL e SUPABASE_ANON_KEY às suas variáveis de ambiente no Vercel
const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY!;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('As variáveis de ambiente SUPABASE_URL e SUPABASE_ANON_KEY precisam ser definidas.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
