import { useState, Fragment } from 'react';
import { Layout } from '../components/layout/Layout';
import { Modal } from '../components/ui/Modal';
import { ConfirmModal } from '../components/ui/ConfirmModal';
import { FinanceiroForm } from '../components/ui/FinanceiroForm';
import { ParcelaForm } from '../components/ui/ParcelaForm';
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
  const [expandedId, setExpandedId] = useState<number | null>(null);

  async function handleCreateFinanceiro(data: FinanceiroFormData) {
    try {
      await createFinanceiro(data);
      setIsCreateModalOpen(false);
    } catch {
      // erro já tratado no hook
    }
  }

  async function handleUpdateFinanceiro(data: FinanceiroFormData) {
    if (!financeiroToEdit) return;
    try {
      await updateFinanceiro(financeiroToEdit.id, data);
      setFinanceiroToEdit(null);
    } catch {
      // erro já tratado no hook
    }
  }

  async function handleDeleteFinanceiro() {
    if (!financeiroToDelete) return;
    try {
      await deleteFinanceiro(financeiroToDelete.id);
      setFinanceiroToDelete(null);
    } catch {
      // erro já tratado no hook
    }
  }

  async function handleQuitarParcela(parcelaId: number) {
    try {
      await quitarParcela(parcelaId);
    } catch {
      // erro já tratado no hook
    }
  }

  async function handleEditarParcela(data: ParcelaFormData) {
    if (!parcelaToEdit) return;
    try {
      await editarParcela(parcelaToEdit.id, data);
      setParcelaToEdit(null);
    } catch {
      // erro já tratado no hook
    }
  }

  return (
    <Layout>
      <header className="page-header-actions">
        <div>
          <h2 className="page-title">Financeiro</h2>
          <p className="page-subtitle">Controle de receitas, despesas e honorários.</p>
        </div>

        <button className="btn-new-entity" onClick={() => setIsCreateModalOpen(true)}>
          Novo Lançamento
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
            Carregando lançamentos...
          </div>
        ) : (
          <table className="lawfy-table">
            <thead className="table-header">
              <tr>
                <th className="table-header-cell">Descrição</th>
                <th className="table-header-cell">Cliente</th>
                <th className="table-header-cell">Tipo</th>
                <th className="table-header-cell text-right">Valor Total</th>
                <th className="table-header-cell text-center">Parcelas</th>
                <th className="table-header-cell text-center">Status</th>
                <th className="table-header-cell text-center">Ações</th>
              </tr>
            </thead>
            <tbody>
              {financeiros.length > 0 ? (
                financeiros.map((item) => (
                  <Fragment key={item.id}>
                    <tr className="table-row">
                      <td className="table-cell-main">{item.descricao}</td>
                      <td className="table-cell-secondary">
                        {item.processos?.clientes?.nome ?? '—'}
                      </td>
                      <td className="table-cell-secondary capitalize">
                        {item.tipo}
                      </td>
                      <td className="table-cell-data text-right font-bold">
                        {new Intl.NumberFormat('pt-BR', {
                          style: 'currency',
                          currency: 'BRL',
                        }).format(item.valor_total)}
                      </td>
                      <td className="table-cell text-center">
                        <button
                          className="btn-table-edit"
                          onClick={() => setExpandedId(expandedId === item.id ? null : item.id)}
                        >
                          {expandedId === item.id ? 'Ocultar' : `Ver ${item.parcelas?.length ?? 0}`}
                        </button>
                      </td>
                      <td className="table-cell text-center">
                        <span className={`badge-status-processo badge-status-${item.status}`}>
                          {item.status.toUpperCase()}
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

                    {/* Parcelas expandidas */}
                    {expandedId === item.id && item.parcelas && item.parcelas.length > 0 && (
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
                              {item.parcelas.map((parcela, index) => (
                                <tr key={parcela.id} className="parcelas-row">
                                  <td className="parcelas-cell">
                                    {index + 1}/{item.parcelas!.length}
                                  </td>
                                  <td className="parcelas-cell">
                                    {new Date(parcela.data_vencimento).toLocaleDateString('pt-BR')}
                                  </td>
                                  <td className="parcelas-cell text-right">
                                    {new Intl.NumberFormat('pt-BR', {
                                      style: 'currency',
                                      currency: 'BRL',
                                    }).format(parcela.valor_parcela)}
                                  </td>
                                  <td className="parcelas-cell text-center">
                                    {parcela.pago ? (
                                      <span className="badge-status-processo badge-status-ativo">
                                        PAGO
                                      </span>
                                    ) : (
                                      <span className="badge-status-processo badge-status-encerrado">
                                        PENDENTE
                                      </span>
                                    )}
                                  </td>
                                  <td className="parcelas-cell text-center">
                                    <div className="flex items-center justify-center gap-2">
                                      {!parcela.pago && (
                                        <>
                                          <button
                                            className="btn-table-edit"
                                            onClick={() => setParcelaToEdit(parcela)}
                                            disabled={saving}
                                          >
                                            Editar
                                          </button>
                                          <button
                                            className="btn-table-edit"
                                            onClick={() => handleQuitarParcela(parcela.id)}
                                            disabled={saving}
                                          >
                                            Quitar
                                          </button>
                                        </>
                                      )}
                                    </div>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </td>
                      </tr>
                    )}
                  </Fragment>
                ))
              ) : (
                !error && (
                  <tr>
                    <td colSpan={7} className="empty-state-row">
                      Nenhum registro financeiro encontrado.
                    </td>
                  </tr>
                )
              )}
            </tbody>
          </table>
        )}
      </section>

      {/* Modal: Novo Lançamento */}
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

      {/* Modal: Editar Lançamento */}
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

      {/* Modal: Editar Parcela */}
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

      {/* Modal: Confirmar Exclusão */}
      <ConfirmModal
        isOpen={!!financeiroToDelete}
        onClose={() => setFinanceiroToDelete(null)}
        onConfirm={handleDeleteFinanceiro}
        title="Excluir Lançamento"
        message={`Tem certeza que deseja excluir o lançamento "${financeiroToDelete?.descricao}"? Todas as parcelas vinculadas também serão excluídas.`}
        isLoading={saving}
      />
    </Layout>
  );
}