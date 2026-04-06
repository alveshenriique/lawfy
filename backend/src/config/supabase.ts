import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_KEY || '';

if (!supabaseUrl || !supabaseKey) {
  console.error("ERRO: Verifique as chaves no seu arquivo .env");
}

// Cliente admin — ignora RLS, usado só para autenticação
export const supabase = createClient(supabaseUrl, supabaseKey);

// Cliente com token do usuário — respeita RLS
export function createUserClient(token: string) {
  return createClient(supabaseUrl, supabaseKey, {
    global: {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  });
}