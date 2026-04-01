import { useState } from 'react';
import { Layout } from '../components/layout/Layout';
import { Modal } from '../components/ui/Modal';
import { ConfirmModal } from '../components/ui/ConfirmModal';
import { ClienteForm } from '../components/ui/ClienteForm';
import { useClientes } from '../hooks/useClientes';
import { formatCpfCnpj, formatTelefone } from '../utils/formatters';
import type { Cliente } from '../types/cliente';
import type { ClienteFormData } from '../lib/validations/cliente';

export function Clientes() {
  const { clientes, loading, saving, error, createCliente, updateCliente, deleteCliente } = useClientes();

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [clienteToEdit, setClienteToEdit] = useState<Cliente | null>(null);
  const [clienteToDelete, setClienteToDelete] = useState<Cliente | null>(null);

  async function handleCreateCliente(data: ClienteFormData) {
    try {
      await createCliente(data);
      setIsCreateModalOpen(false);
    } catch {
      // erro já tratado no hook
    }
  }

  async function handleUpdateCliente(data: ClienteFormData) {
    if (!clienteToEdit) return;
    try {
      await updateCliente(clienteToEdit.id, data);
      setClienteToEdit(null);
    } catch {
      // erro já tratado no hook
    }
  }

  async function handleDeleteCliente() {
    if (!clienteToDelete) return;
    try {
      await deleteCliente(clienteToDelete.id);
      setClienteToDelete(null);
    } catch {
      // erro já tratado no hook
    }
  }

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

      {error && (
        <div className="alert-error">
          {error}
        </div>
      )}

      <section className="table-container">
        {loading ? (
          <div className="loading-container">
            Carregando clientes...
          </div>
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
              {clientes.map((cliente) => (
                <tr key={cliente.id} className="table-row">
                  <td className="table-cell-main">{cliente.nome}</td>
                  <td className="table-cell-secondary">
                    {formatCpfCnpj(cliente.cpf_cnpj)}
                  </td>
                  <td className="table-cell-data">
                    {cliente.telefone ? formatTelefone(cliente.telefone) : '—'}
                  </td>
                  <td className="table-cell-actions">
                    <button
                      className="btn-table-edit"
                      onClick={() => setClienteToEdit(cliente)}
                    >
                      Editar
                    </button>
                    <button
                      className="btn-table-delete"
                      onClick={() => setClienteToDelete(cliente)}
                    >
                      Excluir
                    </button>
                  </td>
                </tr>
              ))}

              {clientes.length === 0 && !error && (
                <tr>
                  <td colSpan={4} className="empty-state-row">
                    Nenhum cliente cadastrado em sua base.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </section>

      {/* Modal: Novo Cliente */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Novo Cliente"
      >
        <ClienteForm
          onSubmit={handleCreateCliente}
          isLoading={saving}
        />
      </Modal>

      {/* Modal: Editar Cliente */}
      <Modal
        isOpen={!!clienteToEdit}
        onClose={() => setClienteToEdit(null)}
        title="Editar Cliente"
      >
        <ClienteForm
          onSubmit={handleUpdateCliente}
          isLoading={saving}
          defaultValues={clienteToEdit ?? undefined}
        />
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