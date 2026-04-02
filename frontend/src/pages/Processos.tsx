import { useState } from 'react';
import { Layout } from '../components/layout/Layout';
import { Modal } from '../components/ui/Modal';
import { ConfirmModal } from '../components/ui/ConfirmModal';
import { ProcessoForm } from '../components/ui/ProcessoForm';
import { useProcessos } from '../hooks/useProcessos';
import { useClientes } from '../hooks/useClientes';
import type { Processo } from '../types/processo';
import type { ProcessoFormData } from '../lib/validations/processo';

export function Processos() {
  const { processos, loading, saving, error, createProcesso, updateProcesso, deleteProcesso } = useProcessos();
  const { clientes } = useClientes();

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [processoToEdit, setProcessoToEdit] = useState<Processo | null>(null);
  const [processoToDelete, setProcessoToDelete] = useState<Processo | null>(null);

  async function handleCreateProcesso(data: ProcessoFormData) {
    try {
      await createProcesso(data);
      setIsCreateModalOpen(false);
    } catch {
      // erro já tratado no hook
    }
  }

  async function handleUpdateProcesso(data: ProcessoFormData) {
    if (!processoToEdit) return;
    try {
      await updateProcesso(processoToEdit.id, data);
      setProcessoToEdit(null);
    } catch {
      // erro já tratado no hook
    }
  }

  async function handleDeleteProcesso() {
    if (!processoToDelete) return;
    try {
      await deleteProcesso(processoToDelete.id);
      setProcessoToDelete(null);
    } catch {
      // erro já tratado no hook
    }
  }

  return (
    <Layout>
      <header className="page-header-actions">
        <div>
          <h2 className="page-title">Processos</h2>
          <p className="page-subtitle">Acompanhe o andamento das causas e ações judiciais.</p>
        </div>

        <button className="btn-new-entity" onClick={() => setIsCreateModalOpen(true)}>
          Novo Processo
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
            Carregando processos...
          </div>
        ) : (
          <table className="lawfy-table">
            <thead className="table-header">
              <tr>
                <th className="table-header-cell">Tipo</th>
                <th className="table-header-cell">Nº do Processo</th>
                <th className="table-header-cell">Partes</th>
                <th className="table-header-cell">Cliente</th>
                <th className="table-header-cell text-center">Status</th>
                <th className="table-header-cell text-center">Ações</th>
              </tr>
            </thead>
            <tbody>
              {processos.length > 0 ? (
                processos.map((processo) => (
                  <tr key={processo.id} className="table-row">
                    <td className="table-cell-secondary capitalize">
                      {processo.tipo}
                    </td>
                    <td className="table-cell-main font-mono text-sm">
                      {processo.numero_processo ?? '—'}
                    </td>
                    <td className="table-cell-data">
                      {processo.nome_partes.split('\n').map((nome, index) => (
                    <span key={index} className="block">{nome}</span>
                        ))}
                    </td>
                    <td className="table-cell-secondary">
                      {processo.clientes?.nome ?? '—'}
                    </td>
                    <td className="table-cell text-center">
                      <span className={`badge-status-processo badge-status-${processo.status}`}>
                        {processo.status.toUpperCase()}
                      </span>
                    </td>
                    <td className="table-cell-actions">
                      <button
                        className="btn-table-edit"
                        onClick={() => setProcessoToEdit(processo)}
                      >
                        Editar
                      </button>
                      <button
                        className="btn-table-delete"
                        onClick={() => setProcessoToDelete(processo)}
                      >
                        Excluir
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                !error && (
                  <tr>
                    <td colSpan={6} className="empty-state-row">
                      Nenhum processo encontrado.
                    </td>
                  </tr>
                )
              )}
            </tbody>
          </table>
        )}
      </section>

      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Novo Processo"
      >
        <ProcessoForm
          onSubmit={handleCreateProcesso}
          isLoading={saving}
          clientes={clientes}
        />
      </Modal>

      <Modal
        isOpen={!!processoToEdit}
        onClose={() => setProcessoToEdit(null)}
        title="Editar Processo"
      >
        <ProcessoForm
          onSubmit={handleUpdateProcesso}
          isLoading={saving}
          clientes={clientes}
          defaultValues={processoToEdit ?? undefined}
        />
      </Modal>

      <ConfirmModal
        isOpen={!!processoToDelete}
        onClose={() => setProcessoToDelete(null)}
        onConfirm={handleDeleteProcesso}
        title="Excluir Processo"
        message={`Tem certeza que deseja excluir o processo "${processoToDelete?.numero_processo ?? processoToDelete?.nome_partes}"? Esta ação não pode ser desfeita.`}
        isLoading={saving}
      />
    </Layout>
  );
}