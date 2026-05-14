import { useState, useMemo, Fragment } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Wallet, FileDown, ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';
import { exportarFinanceiroCSV, exportarFinanceiroPDF } from '../utils/exportar';
import { Layout } from '../components/layout/Layout';
import { Modal } from '../components/ui/Modal';
import { ConfirmModal } from '../components/ui/ConfirmModal';
import { FinanceiroForm } from '../components/ui/FinanceiroForm';
import { ParcelaForm } from '../components/ui/ParcelaForm';
import { TableSkeleton } from '../components/ui/TableSkeleton';
import { EmptyState } from '../components/ui/EmptyState';
import { useFinanceiro } from '../hooks/useFinanceiro';
import { useProcessos } from '../hooks/useProcessos';
import type { Financeiro, Parcela } from '../types/financeiro';
import type { FinanceiroFormData } from '../lib/validations/financeiro';
import type { ParcelaFormData } from '../lib/validations/parcela';

export function Financeiro() {
  const { financeiros, loading, saving, error, createFinanceiro, updateFinanceiro, deleteFinanceiro, quitarParcela, editarParcela } = useFinanceiro();
  const { processos } = useProcessos();

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [financeiroToEdit, setFinanceiroToEdit] = useState<Financeiro | null>(null);
  const [financeiroToDelete, setFinanceiroToDelete] = useState<Financeiro | null>(null);
  const [parcelaToEdit, setParcelaToEdit] = useState<Parcela | null>(null);
  const [expandedIds, setExpandedIds] = useState<Set<number>>(new Set());

  function toggleExpanded(id: number) {
    setExpandedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  }
  const [searchParams] = useSearchParams();
  const [search, setSearch] = useState('');
  const [filtroTipo, setFiltroTipo] = useState(searchParams.get('tipo') ?? '');
  const [filtroStatus, setFiltroStatus] = useState(searchParams.get('status') ?? '');
  const [sortField, setSortField] = useState<'cliente' | 'valor' | 'vencimento' | null>(null);
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');

  function handleSort(field: 'cliente' | 'valor' | 'vencimento') {
    if (sortField === field) {
      setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDir('asc');
    }
  }

  function sortIcon(field: 'cliente' | 'valor' | 'vencimento') {
    if (sortField !== field) return <ArrowUpDown size={13} className="opacity-40 shrink-0" />;
    return sortDir === 'asc' ? <ArrowUp size={13} className="shrink-0" /> : <ArrowDown size={13} className="shrink-0" />;
  }

  const financeirosFiltrados = useMemo(() => {
    return financeiros.filter(item => {
      const matchSearch = !search.trim() ||
        item.descricao.toLowerCase().includes(search.toLowerCase()) ||
        (item.processos?.clientes?.nome ?? '').toLowerCase().includes(search.toLowerCase());

      const matchTipo = !filtroTipo || item.tipo === filtroTipo;
      const matchStatus = !filtroStatus || item.status === filtroStatus;

      return matchSearch && matchTipo && matchStatus;
    });
  }, [financeiros, search, filtroTipo, filtroStatus]);

  const financeirosSorted = useMemo(() => {
    if (!sortField) return financeirosFiltrados;
    return [...financeirosFiltrados].sort((a, b) => {
      let cmp = 0;
      if (sortField === 'cliente') {
        cmp = (a.processos?.clientes?.nome ?? '').localeCompare(b.processos?.clientes?.nome ?? '', 'pt-BR');
      } else if (sortField === 'valor') {
        cmp = a.valor_total - b.valor_total;
      } else if (sortField === 'vencimento') {
        const aData = [...(a.parcelas ?? [])].sort((x, y) => x.data_vencimento.localeCompare(y.data_vencimento))[0]?.data_vencimento ?? '';
        const bData = [...(b.parcelas ?? [])].sort((x, y) => x.data_vencimento.localeCompare(y.data_vencimento))[0]?.data_vencimento ?? '';
        cmp = aData.localeCompare(bData);
      }
      return sortDir === 'asc' ? cmp : -cmp;
    });
  }, [financeirosFiltrados, sortField, sortDir]);

  async function handleCreateFinanceiro(data: FinanceiroFormData) {
    try {
      await createFinanceiro(data);
      setIsCreateModalOpen(false);
    } catch { /* erro tratado no hook */ }
  }

  async function handleUpdateFinanceiro(data: FinanceiroFormData) {
    if (!financeiroToEdit) return;
    try {
      await updateFinanceiro(financeiroToEdit.id, data);
      setFinanceiroToEdit(null);
    } catch { /* erro tratado no hook */ }
  }

  async function handleDeleteFinanceiro() {
    if (!financeiroToDelete) return;
    try {
      await deleteFinanceiro(financeiroToDelete.id);
      setFinanceiroToDelete(null);
    } catch { /* erro tratado no hook */ }
  }

  async function handleTogglePagamento(parcelaId: number, statusAtual: boolean) {
    try {
      await quitarParcela(parcelaId, !statusAtual);
    } catch { /* erro tratado no hook */ }
  }

  async function handleEditarParcela(data: ParcelaFormData) {
    if (!parcelaToEdit) return;
    try {
      await editarParcela(parcelaToEdit.id, data);
      setParcelaToEdit(null);
    } catch { /* erro tratado no hook */ }
  }

  return (
    <Layout>
      <header className="page-header-actions">
        <div>
          <h2 className="page-title">Financeiro</h2>
          <p className="page-subtitle">Controle de receitas, despesas e honorários.</p>
        </div>
        <button className="btn-new-entity w-44" onClick={() => setIsCreateModalOpen(true)}>
          Novo Lançamento
        </button>
      </header>

      {error && <div className="alert-error">{error}</div>}

      <div className="mb-6">
        <div className="search-bar">
          <input
            type="text"
            className="search-input"
            placeholder="Buscar por descrição ou cliente..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          <select
            className="search-filter"
            value={filtroTipo}
            onChange={e => setFiltroTipo(e.target.value)}
          >
            <option value="">Todos os tipos</option>
            <option value="receita">Receita</option>
            <option value="despesa">Despesa</option>
          </select>
          <select
            className="search-filter"
            value={filtroStatus}
            onChange={e => setFiltroStatus(e.target.value)}
          >
            <option value="">Todos os status</option>
            <option value="pendente">Aberto</option>
            <option value="pago">Pago</option>
          </select>
          <div className="flex gap-2 w-44">
            <button className="btn-export flex-1 justify-center" onClick={() => exportarFinanceiroCSV(financeirosSorted, filtroStatus)}>
              <FileDown size={14} className="mr-1" />CSV
            </button>
            <button className="btn-export flex-1 justify-center" onClick={() => exportarFinanceiroPDF(financeirosSorted, filtroStatus)}>
              <FileDown size={14} className="mr-1" />PDF
            </button>
          </div>
        </div>

        {(search || filtroTipo || filtroStatus) && (
          <div className="mt-2 px-1">
            <span className="search-results font-medium">
              {financeirosFiltrados.length} resultado{financeirosFiltrados.length !== 1 ? 's' : ''} encontrado{financeirosFiltrados.length !== 1 ? 's' : ''}
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
                <th className="table-header-cell">Descrição</th>
                <th className="table-header-cell cursor-pointer select-none" onClick={() => handleSort('cliente')}>
                  <span className="inline-flex items-center gap-1">Cliente {sortIcon('cliente')}</span>
                </th>
                <th className="table-header-cell">Tipo</th>
                <th className="table-header-cell text-right cursor-pointer select-none" onClick={() => handleSort('valor')}>
                  <span className="inline-flex items-center gap-1">Valor Total{sortIcon('valor')}</span>
                </th>
                <th className="table-header-cell text-center cursor-pointer select-none" onClick={() => handleSort('vencimento')}>
                  <span className="inline-flex items-center justify-center gap-1">Parcelas {sortIcon('vencimento')}</span>
                </th>
                <th className="table-header-cell text-center">Status</th>
                <th className="table-header-cell text-center">Ações</th>
              </tr>
            </thead>
            <tbody>
              {financeirosSorted.length > 0 ? (
                financeirosSorted.map((item) => {
                  const parcelasOrdemCronologica = [...(item.parcelas ?? [])].sort((a, b) =>
                    new Date(a.data_vencimento).getTime() - new Date(b.data_vencimento).getTime()
                  );
                  return (
                  <Fragment key={item.id}>
                    <tr className="table-row">
                      <td className="table-cell-main">{item.descricao}</td>
                      <td className="table-cell-secondary">
                        {item.processos?.clientes?.nome ?? '—'}
                      </td>
                      <td className="table-cell-secondary capitalize">{item.tipo}</td>
                      <td className="table-cell-data text-right font-bold">
                        {new Intl.NumberFormat('pt-BR', {
                          style: 'currency',
                          currency: 'BRL',
                        }).format(item.valor_total)}
                      </td>
                      <td className="table-cell text-center">
                        <button
                          className="btn-table-edit"
                          onClick={() => toggleExpanded(item.id)}
                        >
                          {expandedIds.has(item.id) ? 'Ocultar' : `Ver ${item.parcelas?.length ?? 0}`}
                        </button>
                      </td>
                      <td className="table-cell text-center">
                        <span className={`badge-status-processo badge-status-${item.status}`}>
                          {item.status === 'pendente' ? 'ABERTO' : item.status.toUpperCase()}
                        </span>
                      </td>
                      <td className="table-cell-actions">
                        <button
                          className="btn-table-edit"
                          onClick={() => setFinanceiroToEdit(item)}
                        >
                          Editar
                        </button>
                        <button
                          className="btn-table-delete"
                          onClick={() => setFinanceiroToDelete(item)}
                        >
                          Excluir
                        </button>
                      </td>
                    </tr>

                    {expandedIds.has(item.id) && item.parcelas && (
                      <tr>
                        <td colSpan={7} className="parcelas-container">
                          <table className="parcelas-table">
                            <thead>
                              <tr>
                                <th className="parcelas-header-cell">Parcela</th>
                                <th className="parcelas-header-cell">Vencimento</th>
                                <th className="parcelas-header-cell text-right">Valor</th>
                                <th className="parcelas-header-cell text-center">Status</th>
                                <th className="parcelas-header-cell text-center">Ações</th>
                              </tr>
                            </thead>
                            <tbody>
                              {item.parcelas.map((parcela) => {
                                const numeroParcela = parcelasOrdemCronologica.findIndex(p => p.id === parcela.id) + 1;
                                return (
                                  <tr key={parcela.id} className="parcelas-row">
                                    <td className="parcelas-cell">
                                      {numeroParcela}/{item.parcelas!.length}
                                    </td>
                                    <td className="parcelas-cell">
                                      {new Date(parcela.data_vencimento + 'T00:00:00').toLocaleDateString('pt-BR')}
                                    </td>
                                    <td className="parcelas-cell text-right">
                                      {new Intl.NumberFormat('pt-BR', {
                                        style: 'currency',
                                        currency: 'BRL',
                                      }).format(parcela.valor_parcela)}
                                    </td>
                                    <td className="parcelas-cell text-center">
                                      <span className={`badge-status-processo ${parcela.pago ? 'badge-status-pago' : 'badge-status-pendente'}`}>
                                        {parcela.pago ? 'PAGO' : 'ABERTO'}
                                      </span>
                                    </td>
                                    <td className="parcelas-cell text-center">
                                      <div className="flex items-center justify-center gap-2">
                                        <button
                                          className="btn-table-edit"
                                          onClick={() => setParcelaToEdit(parcela)}
                                          disabled={saving}
                                        >
                                          Editar
                                        </button>
                                        <button
                                          className="btn-table-edit"
                                          onClick={() => handleTogglePagamento(parcela.id, parcela.pago)}
                                          disabled={saving}
                                        >
                                          {parcela.pago ? 'Desfazer' : 'Quitar'}
                                        </button>
                                      </div>
                                    </td>
                                  </tr>
                                );
                              })}
                            </tbody>
                          </table>
                        </td>
                      </tr>
                    )}
                  </Fragment>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={7}>
                    <EmptyState
                      icon={Wallet}
                      title={filtroTipo || filtroStatus ? 'Nenhum lançamento encontrado' : 'Nenhum lançamento cadastrado'}
                      description={filtroTipo || filtroStatus ? 'Tente ajustar os filtros.' : 'Clique em "Novo Lançamento" para adicionar o primeiro.'}
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
        title="Novo Lançamento"
      >
        <FinanceiroForm
          onSubmit={handleCreateFinanceiro}
          isLoading={saving}
          processos={processos}
        />
      </Modal>

      <Modal
        isOpen={!!financeiroToEdit}
        onClose={() => setFinanceiroToEdit(null)}
        title="Editar Lançamento"
      >
        <FinanceiroForm
          onSubmit={handleUpdateFinanceiro}
          isLoading={saving}
          processos={processos}
          defaultValues={financeiroToEdit ?? undefined}
        />
      </Modal>

      <Modal
        isOpen={!!parcelaToEdit}
        onClose={() => setParcelaToEdit(null)}
        title="Editar Parcela"
      >
        <ParcelaForm
          onSubmit={handleEditarParcela}
          isLoading={saving}
          defaultValues={parcelaToEdit ?? undefined}
        />
      </Modal>

      <ConfirmModal
        isOpen={!!financeiroToDelete}
        onClose={() => setFinanceiroToDelete(null)}
        onConfirm={handleDeleteFinanceiro}
        title="Excluir Lançamento"
        message={`Deseja excluir o lançamento "${financeiroToDelete?.descricao}"? Todas as parcelas vinculadas também serão excluídas.`}
        isLoading={saving}
      />
    </Layout>
  );
}