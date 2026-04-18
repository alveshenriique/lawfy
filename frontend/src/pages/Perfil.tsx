import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Layout } from '../components/layout/Layout';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { usePerfil } from '../hooks/usePerfil';
import { nomeSchema, senhaSchema, type NomeFormData, type SenhaFormData } from '../lib/validations/perfil';

export function Perfil() {
  const { user, saving, atualizarNome, atualizarSenha } = usePerfil();
  const [abaAtiva, setAbaAtiva] = useState<'nome' | 'senha'>('nome');

  const nomeForm = useForm<NomeFormData>({
    resolver: zodResolver(nomeSchema),
    defaultValues: {
      nome: user?.nome ?? '',
    },
  });

  const senhaForm = useForm<SenhaFormData>({
    resolver: zodResolver(senhaSchema),
    defaultValues: {
      senha_atual: '',
      nova_senha: '',
      confirmar_senha: '',
    },
  });

  async function handleAtualizarNome(data: NomeFormData) {
    try {
      await atualizarNome(data);
    } catch {
      // erro tratado no hook
    }
  }

  async function handleAtualizarSenha(data: SenhaFormData) {
    try {
      await atualizarSenha(data);
      senhaForm.reset();
    } catch {
      // erro tratado no hook
    }
  }

  return (
    <Layout>
      <header className="page-header-actions">
        <div>
          <h2 className="page-title">Meu Perfil</h2>
          <p className="page-subtitle">Gerencie suas informações pessoais e senha.</p>
        </div>
      </header>

      {/* Avatar */}
      <div className="perfil-avatar-section">
        <div className="perfil-avatar">
          {user?.nome?.charAt(0)}
        </div>
        <div>
          <p className="perfil-nome">{user?.nome}</p>
          <p className="perfil-email">{user?.email}</p>
        </div>
      </div>

      {/* Abas */}
      <div className="perfil-tabs">
        <button
          className={`perfil-tab ${abaAtiva === 'nome' ? 'perfil-tab-active' : ''}`}
          onClick={() => setAbaAtiva('nome')}
        >
          Dados Pessoais
        </button>
        <button
          className={`perfil-tab ${abaAtiva === 'senha' ? 'perfil-tab-active' : ''}`}
          onClick={() => setAbaAtiva('senha')}
        >
          Alterar Senha
        </button>
      </div>

      {/* Conteúdo das abas */}
      <div className="perfil-content">

        {abaAtiva === 'nome' && (
          <form onSubmit={nomeForm.handleSubmit(handleAtualizarNome)} className="flex flex-col gap-4 max-w-md">
            <Input
              label="Nome completo"
              placeholder="Ex: Maria Silva"
              {...nomeForm.register('nome')}
              error={nomeForm.formState.errors.nome?.message}
            />
            <Input
              label="E-mail"
              value={user?.email ?? ''}
              disabled
              readOnly
            />
            <div className="pt-2">
              <Button type="submit" loading={saving}>
                Salvar alterações
              </Button>
            </div>
          </form>
        )}

        {abaAtiva === 'senha' && (
          <form onSubmit={senhaForm.handleSubmit(handleAtualizarSenha)} className="flex flex-col gap-4 max-w-md">
            <Input
              label="Senha atual"
              type="password"
              placeholder="••••••••"
              {...senhaForm.register('senha_atual')}
              error={senhaForm.formState.errors.senha_atual?.message}
            />
            <Input
              label="Nova senha"
              type="password"
              placeholder="••••••••"
              {...senhaForm.register('nova_senha')}
              error={senhaForm.formState.errors.nova_senha?.message}
            />
            <Input
              label="Confirmar nova senha"
              type="password"
              placeholder="••••••••"
              {...senhaForm.register('confirmar_senha')}
              error={senhaForm.formState.errors.confirmar_senha?.message}
            />
            <div className="pt-2">
              <Button type="submit" loading={saving}>
                Atualizar senha
              </Button>
            </div>
          </form>
        )}
      </div>
    </Layout>
  );
}