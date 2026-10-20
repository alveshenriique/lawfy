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

// Cliente descartável — só para validar credenciais (ex: senha atual).
// Não guarda sessão nem agenda refresh, então nada vaza para outras requisições.
export function createCredentialCheckClient() {
  return createClient(supabaseUrl, supabaseKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

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