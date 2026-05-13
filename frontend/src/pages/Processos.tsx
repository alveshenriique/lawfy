import { useState, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Scale, FileDown } from 'lucide-react';
import { exportarProcessosCSV, exportarProcessosPDF } from '../utils/exportar';
import { Layout } from '../components/layout/Layout';
import { Modal } from '../components/ui/Modal';
import { ConfirmModal } from '../components/ui/ConfirmModal';
import { ProcessoForm } from '../components/ui/ProcessoForm';
import { TableSkeleton } from '../components/ui/TableSkeleton';
import { EmptyState } from '../components/ui/EmptyState';
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
  const [searchParams] = useSearchParams();
  const [search, setSearch] = useState('');
  const [filtroStatus, setFiltroStatus] = useState(searchParams.get('status') ?? '');

  const processosFiltrados = useMemo(() => {
    return processos.filter(processo => {
      const matchSearch = !search.trim() ||
        processo.nome_partes.toLowerCase().includes(search.toLowerCase()) ||
        processo.clientes?.nome.toLowerCase().includes(search.toLowerCase()) ||
        (processo.numero_processo ?? '').toLowerCase().includes(search.toLowerCase());

      const matchStatus = !filtroStatus || processo.status === filtroStatus;

      return matchSearch && matchStatus;
    });
  }, [processos, search, filtroStatus]);

  async function handleCreateProcesso(data: ProcessoFormData) {
    try {
      await createProcesso(data);
      setIsCreateModalOpen(false);
    } catch { /* erro tratado no hook */ }
  }

  async function handleUpdateProcesso(data: ProcessoFormData) {
    if (!processoToEdit) return;
    try {
      await updateProcesso(processoToEdit.id, data);
      setProcessoToEdit(null);
    } catch { /* erro tratado no hook */ }
  }

  async function handleDeleteProcesso() {
    if (!processoToDelete) return;
    try {
      await deleteProcesso(processoToDelete.id);
      setProcessoToDelete(null);
    } catch { /* erro tratado no hook */ }
  }

  return (
    <Layout>
      <header className="page-header-actions">
        <div>
          <h2 className="page-title">Processos</h2>
          <p className="page-subtitle">Acompanhe o andamento das causas e ações judiciais.</p>
        </div>

        <button className="btn-new-entity w-44" onClick={() => setIsCreateModalOpen(true)}>
          Novo Processo
        </button>
      </header>

      {error && <div className="alert-error">{error}</div>}

      <div className="mb-6">
        <div className="search-bar">
          <input
            type="text"
            className="search-input"
            placeholder="Buscar por nº do processo, partes ou cliente..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          <select
            className="search-filter"
            value={filtroStatus}
            onChange={e => setFiltroStatus(e.target.value)}
          >
            <option value="">Todos os status</option>
            <option value="ativo">Ativo</option>
            <option value="arquivado">Arquivado</option>
            <option value="encerrado">Encerrado</option>
          </select>
          <div className="flex gap-2 w-44">
            <button className="btn-export flex-1 justify-center" onClick={() => exportarProcessosCSV(processosFiltrados)}>
              <FileDown size={14} className="mr-1" />CSV
            </button>
            <button className="btn-export flex-1 justify-center" onClick={() => exportarProcessosPDF(processosFiltrados)}>
              <FileDown size={14} className="mr-1" />PDF
            </button>
          </div>
        </div>

        {/* Condição: Só aparece se houver busca ou filtro de status */}
        {(search || filtroStatus) && (
          <div className="mt-2 px-1">
            <span className="search-results font-medium">
              {processosFiltrados.length} resultado{processosFiltrados.length !== 1 ? 's' : ''} encontrado{processosFiltrados.length !== 1 ? 's' : ''}
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
                <th className="table-header-cell">Tipo</th>
                <th className="table-header-cell">Nº do Processo</th>
                <th className="table-header-cell">Partes</th>
                <th className="table-header-cell">Cliente</th>
                <th className="table-header-cell text-center">Status</th>
                <th className="table-header-cell text-center">Ações</th>
              </tr>
            </thead>
            <tbody>
              {processosFiltrados.length > 0 ? (
                processosFiltrados.map((processo) => (
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
                <tr>
                  <td colSpan={6}>
                    <EmptyState
                      icon={Scale}
                      title={search || filtroStatus ? 'Nenhum processo encontrado' : 'Nenhum processo cadastrado'}
                      description={search || filtroStatus ? 'Tente ajustar os filtros.' : 'Clique em "Novo Processo" para adicionar o primeiro.'}
                    />
                  </td>
                </tr>
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