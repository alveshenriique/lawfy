import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { isAxiosError } from 'axios';
import toast from 'react-hot-toast';
import { perfilService } from '../services/perfil';
import { useAuth } from './useAuth';
import type { NomeFormData, SenhaFormData } from '../lib/validations/perfil';

export function usePerfil() {
  const { user, updateUser, signOut } = useAuth();
  const navigate = useNavigate();
  const [saving, setSaving] = useState(false);

  async function atualizarNome(data: NomeFormData) {
    try {
      setSaving(true);
      const result = await perfilService.atualizarNome(data.nome);
      updateUser({ nome: result.usuario.nome });
      toast.success('Nome atualizado com sucesso!');
    } catch (err) {
      console.error(err);
      const mensagem = isAxiosError(err) && err.response?.data?.erro
        ? err.response.data.erro
        : 'Não foi possível atualizar o nome.';
      toast.error(mensagem);
      throw err;
    } finally {
      setSaving(false);
    }
  }

  async function atualizarSenha(data: SenhaFormData) {
    try {
      setSaving(true);
      await perfilService.atualizarSenha(data.senha_atual, data.nova_senha);

      // Trocar a senha revoga as sessões no Supabase, então o token atual já não vale.
      // Deslogamos de propósito com uma mensagem clara, em vez de deixar a próxima
      // requisição cair no "Sessão expirada" genérico do interceptor.
      toast.success('Senha alterada, entre novamente.', { duration: 5000 });
      signOut();
      navigate('/login', { replace: true });
    } catch (err) {
      console.error(err);
      const mensagem = isAxiosError(err) && err.response?.data?.erro
        ? err.response.data.erro
        : 'Não foi possível atualizar a senha.';
      toast.error(mensagem);
      throw err;
    } finally {
      setSaving(false);
    }
  }

  return {
    user,
    saving,
    atualizarNome,
    atualizarSenha,
  };
}