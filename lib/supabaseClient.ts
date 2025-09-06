import { createClient } from '@supabase/supabase-js';

// No Vercel, as variáveis de ambiente do projeto são expostas para as funções serverless.
// Usamos as mesmas variáveis do frontend para unificar a configuração.
const supabaseUrl = process.env.VITE_SUPABASE_URL!;
const supabaseAnonKey = process.env.VITE_SUPABASE_KEY!;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('As variáveis de ambiente VITE_SUPABASE_URL e VITE_SUPABASE_KEY precisam ser definidas.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
