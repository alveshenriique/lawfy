import { useState, useMemo } from 'react';
import { Users, Share2 } from 'lucide-react';
import { Layout } from '../components/layout/Layout';
import { Modal } from '../components/ui/Modal';
import { ConfirmModal } from '../components/ui/ConfirmModal';
import { ClienteForm } from '../components/ui/ClienteForm';
import { TableSkeleton } from '../components/ui/TableSkeleton';
import { EmptyState } from '../components/ui/EmptyState';
import { useClientes } from '../hooks/useClientes';
import { useCompartilhamento } from '../hooks/useCompartilhamento';
import { useAuth } from '../hooks/useAuth';
import { formatCpfCnpj, formatTelefone } from '../utils/formatters';
import type { Cliente } from '../types/cliente';
import type { ClienteFormData } from '../lib/validations/cliente';

export function Clientes() {
  const { clientes, loading, saving, error, createCliente, updateCliente, deleteCliente } = useClientes();
  const { user } = useAuth();
  const { clientesCompartilhados, loading: loadingShare, compartilhar, remover } = useCompartilhamento();

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [clienteToEdit, setClienteToEdit] = useState<Cliente | null>(null);
  const [clienteToDelete, setClienteToDelete] = useState<Cliente | null>(null);
  const [clienteToView, setClienteToView] = useState<Cliente | null>(null);
  const [clienteToShare, setClienteToShare] = useState<Cliente | null>(null);
  const [search, setSearch] = useState('');

  const clientesFiltrados = useMemo(() => {
    if (!search.trim()) return clientes;
    const termo = search.toLowerCase().replace(/\D/g, '') || search.toLowerCase();
    return clientes.filter(cliente =>
      cliente.nome.toLowerCase().includes(search.toLowerCase()) ||
      cliente.cpf_cnpj.replace(/\D/g, '').includes(termo)
    );
  }, [clientes, search]);

  async function handleCreateCliente(data: ClienteFormData) {
    try {
      await createCliente(data);
      setIsCreateModalOpen(false);
    } catch {
      // erro tratado no hook
    }
  }

  async function handleUpdateCliente(data: ClienteFormData) {
    if (!clienteToEdit) return;
    try {
      await updateCliente(clienteToEdit.id, data);
      setClienteToEdit(null);
    } catch {
      // erro tratado no hook
    }
  }

  async function handleDeleteCliente() {
    if (!clienteToDelete) return;
    try {
      await deleteCliente(clienteToDelete.id);
      setClienteToDelete(null);
    } catch {
      // erro tratado no hook
    }
  }

  async function handleConfirmShare() {
    if (!clienteToShare) return;
    const jaCompartilhado = clientesCompartilhados.has(clienteToShare.id);
    if (jaCompartilhado) {
      await remover(clienteToShare.id);
    } else {
      await compartilhar(clienteToShare.id);
    }
    setClienteToShare(null);
  }

  function formatEndereco(cliente: Cliente) {
    const partes = [
      cliente.logradouro,
      cliente.numero && `nº ${cliente.numero}`,
      cliente.complemento,
      cliente.bairro,
      cliente.cidade,
      cliente.estado,
    ].filter(Boolean);
    return partes.length > 0 ? partes.join(', ') : null;
  }

  const isOwner = (cliente: Cliente) => cliente.user_id === user?.id;
  const isShared = (cliente: Cliente) => clientesCompartilhados.has(cliente.id);

  return (
    <Layout>
      <header className="page-header-actions">
        <div>
          <h2 className="page-title">Clientes</h2>
          <p className="page-subtitle">Gerencie os dados cadastrais de seus clientes.</p>
        </div>
        <button className="btn-new-entity" onClick={() => setIsCreateModalOpen(true)}>
          Novo Cliente
        </button>
      </header>

      {error && <div className="alert-error">{error}</div>}

      <div className="mb-6">
        <div className="search-bar">
          <input
            type="text"
            className="search-input"
            placeholder="Buscar por nome ou CPF/CNPJ..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        {search && (
          <div className="mt-2 px-1">
            <span className="search-results font-medium">
              {clientesFiltrados.length} resultado{clientesFiltrados.length !== 1 ? 's' : ''} encontrado{clientesFiltrados.length !== 1 ? 's' : ''}
            </span>
          </div>
        )}
      </div>

      <section className="table-container">
        {loading ? (
          <TableSkeleton rows={5} />
        ) : (
          <table className="lawfy-table">
            <thead className="table-header">
              <tr>
                <th className="table-header-cell">Nome / Razão Social</th>
                <th className="table-header-cell">CPF / CNPJ</th>
                <th className="table-header-cell">Telefone</th>
                <th className="table-header-cell text-center">Ações</th>
              </tr>
            </thead>
            <tbody>
              {clientesFiltrados.map((cliente) => (
                <tr key={cliente.id} className="table-row">
                  <td className="table-cell-main">
                    <div className="flex items-center gap-2">
                      <button className="cliente-nome-btn" onClick={() => setClienteToView(cliente)}>
                        {cliente.nome}
                      </button>
                      {(!isOwner(cliente) || isShared(cliente)) && (
                        <span className="text-xs px-2 py-0.5 rounded-full bg-blue-50 text-blue-600 border border-blue-100 font-medium">
                          Compartilhado
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="table-cell-secondary">{formatCpfCnpj(cliente.cpf_cnpj)}</td>
                  <td className="table-cell-data">
                    {cliente.telefone ? formatTelefone(cliente.telefone) : '—'}
                  </td>
                  <td className="table-cell-actions">
                    <button className="btn-table-edit" onClick={() => setClienteToEdit(cliente)}>
                      Editar
                    </button>
                    {isOwner(cliente) && (
                      <button
                        title={isShared(cliente) ? 'Remover compartilhamento' : 'Compartilhar'}
                        onClick={() => setClienteToShare(cliente)}
                        disabled={loadingShare}
                        className={`p-1.5 rounded transition-colors ${isShared(cliente) ? 'text-slate-400 hover:text-slate-600' : 'text-blue-500 hover:text-blue-700'}`}
                      >
                        <Share2 size={15} />
                      </button>
                    )}
                    <button className="btn-table-delete" onClick={() => setClienteToDelete(cliente)}>
                      Excluir
                    </button>
                  </td>
                </tr>
              ))}

              {clientesFiltrados.length === 0 && !error && (
                <tr>
                  <td colSpan={4}>
                    <EmptyState
                      icon={Users}
                      title={search ? 'Nenhum cliente encontrado' : 'Nenhum cliente cadastrado'}
                      description={search ? 'Tente uma busca diferente.' : 'Clique em "Novo Cliente" para adicionar o primeiro.'}
                    />
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </section>

      {/* Modal: Detalhes do Cliente */}
      <Modal isOpen={!!clienteToView} onClose={() => setClienteToView(null)} title="Detalhes do Cliente">
        {clienteToView && (
          <div className="cliente-detalhes">
            <div className="cliente-detalhe-grupo">
              <span className="cliente-detalhe-label">Nome / Razão Social</span>
              <span className="cliente-detalhe-valor">{clienteToView.nome}</span>
            </div>
            <div className="cliente-detalhe-grupo">
              <span className="cliente-detalhe-label">CPF / CNPJ</span>
              <span className="cliente-detalhe-valor">{formatCpfCnpj(clienteToView.cpf_cnpj)}</span>
            </div>
            {clienteToView.telefone && (
              <div className="cliente-detalhe-grupo">
                <span className="cliente-detalhe-label">Telefone</span>
                <span className="cliente-detalhe-valor">{formatTelefone(clienteToView.telefone)}</span>
              </div>
            )}
            {formatEndereco(clienteToView) && (
              <>
                <div className="form-section-divider">
                  <span className="form-section-label">Endereço</span>
                </div>
                {clienteToView.cep && (
                  <div className="cliente-detalhe-grupo">
                    <span className="cliente-detalhe-label">CEP</span>
                    <span className="cliente-detalhe-valor">{clienteToView.cep}</span>
                  </div>
                )}
                {clienteToView.logradouro && (
                  <div className="cliente-detalhe-grupo">
                    <span className="cliente-detalhe-label">Logradouro</span>
                    <span className="cliente-detalhe-valor">
                      {clienteToView.logradouro}
                      {clienteToView.numero && `, nº ${clienteToView.numero}`}
                      {clienteToView.complemento && ` - ${clienteToView.complemento}`}
                    </span>
                  </div>
                )}
                {clienteToView.bairro && (
                  <div className="cliente-detalhe-grupo">
                    <span className="cliente-detalhe-label">Bairro</span>
                    <span className="cliente-detalhe-valor">{clienteToView.bairro}</span>
                  </div>
                )}
                {clienteToView.cidade && (
                  <div className="cliente-detalhe-grupo">
                    <span className="cliente-detalhe-label">Cidade / Estado</span>
                    <span className="cliente-detalhe-valor">
                      {clienteToView.cidade}{clienteToView.estado && ` - ${clienteToView.estado}`}
                    </span>
                  </div>
                )}
              </>
            )}
            {!formatEndereco(clienteToView) && (
              <p className="text-sm text-lawfy-text-soft text-center py-2">Endereço não cadastrado.</p>
            )}
            <div className="pt-4 flex gap-3 justify-end">
              <button
                className="btn-table-edit"
                onClick={() => { setClienteToView(null); setClienteToEdit(clienteToView); }}
              >
                Editar cliente
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* Modal: Confirmar compartilhamento */}
      <ConfirmModal
        isOpen={!!clienteToShare}
        onClose={() => setClienteToShare(null)}
        onConfirm={handleConfirmShare}
        title={clienteToShare && isShared(clienteToShare) ? 'Remover compartilhamento' : 'Compartilhar cliente'}
        message={
          clienteToShare && isShared(clienteToShare)
            ? `Remover o acesso compartilhado de "${clienteToShare?.nome}"? As outras advogadas deixarão de ver este cliente e seus dados.`
            : `Compartilhar "${clienteToShare?.nome}" com todas as advogadas do escritório? Elas terão acesso completo a este cliente, seus processos e financeiro.`
        }
        confirmLabel={clienteToShare && isShared(clienteToShare) ? 'Remover acesso' : 'Compartilhar'}
        confirmVariant={clienteToShare && isShared(clienteToShare) ? 'danger' : 'primary'}
        isLoading={loadingShare}
      />

      {/* Modal: Novo Cliente */}
      <Modal isOpen={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)} title="Novo Cliente" size="lg">
        <ClienteForm onSubmit={handleCreateCliente} isLoading={saving} />
      </Modal>

      {/* Modal: Editar Cliente */}
      <Modal isOpen={!!clienteToEdit} onClose={() => setClienteToEdit(null)} title="Editar Cliente" size="lg">
        <ClienteForm onSubmit={handleUpdateCliente} isLoading={saving} defaultValues={clienteToEdit ?? undefined} />
      </Modal>

      {/* Modal: Confirmar Exclusão */}
      <ConfirmModal
        isOpen={!!clienteToDelete}
        onClose={() => setClienteToDelete(null)}
        onConfirm={handleDeleteCliente}
        title="Excluir Cliente"
        message={`Tem certeza que deseja excluir o cliente "${clienteToDelete?.nome}"? Esta ação não pode ser desfeita.`}
        isLoading={saving}
      />
    </Layout>
  );
}
