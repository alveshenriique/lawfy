import { useState } from 'react';
import toast from 'react-hot-toast';
import { perfilService } from '../services/perfil';
import { useAuth } from './useAuth';
import type { NomeFormData, SenhaFormData } from '../lib/validations/perfil';

export function usePerfil() {
  const { user, updateUser } = useAuth();
  const [saving, setSaving] = useState(false);

  async function atualizarNome(data: NomeFormData) {
    try {
      setSaving(true);
      const result = await perfilService.atualizarNome(data.nome);
      updateUser({ nome: result.usuario.nome });
      toast.success('Nome atualizado com sucesso!');
    } catch (err) {
      console.error(err);
      throw err;
    } finally {
      setSaving(false);
    }
  }

  async function atualizarSenha(data: SenhaFormData) {
    try {
      setSaving(true);
      await perfilService.atualizarSenha(data.senha_atual, data.nova_senha);
      toast.success('Senha atualizada com sucesso!');
    } catch (err) {
      console.error(err);
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