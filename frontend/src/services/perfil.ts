import { api } from './api';

export interface PerfilResumo {
  id: string;
  email: string;
  nome: string;
}

export const perfilService = {
  atualizarNome: (nome: string) =>
    api.put<{ message: string; usuario: PerfilResumo }>('/perfil/nome', { nome }).then(r => r.data),

  atualizarSenha: (senha_atual: string, nova_senha: string) =>
    api.put<{ message: string }>('/perfil/senha', { senha_atual, nova_senha }).then(r => r.data),
};