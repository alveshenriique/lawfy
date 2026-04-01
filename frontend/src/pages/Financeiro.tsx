import { Layout } from '../components/layout/Layout';
import { useFinanceiro } from '../hooks/useFinanceiro';
import { Button } from '../components/ui/Button';

export function Financeiro() {
  const { financeiros, loading, error } = useFinanceiro();

  return (
    <Layout>
      <header className="page-header-actions">
        <div>
          <h2 className="page-title">Financeiro</h2>
          <p className="page-subtitle">Controle de receitas, despesas e honorários.</p>
        </div>
        
        <Button className="btn-new-entity">
          Novo Lançamento
        </Button>
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
                <th className="table-header-cell">Tipo</th>
                <th className="table-header-cell text-right">Valor Total</th>
                <th className="table-header-cell text-center">Status</th>
              </tr>
            </thead>
            <tbody>
              {financeiros.length > 0 ? (
                financeiros.map((item) => (
                  <tr key={item.id} className="table-row">
                    <td className="table-cell-main">
                      {item.descricao}
                    </td>
                    <td className="table-cell-secondary italic">
                      {item.tipo === 'receita' ? 'Receita' : 'Despesa'}
                    </td>
                    <td className="table-cell-data text-right font-bold">
                      {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(item.valor_total)}
                    </td>
                    <td className="table-cell text-center">
                      <span className={`badge-status-${item.status}`}>
                        {item.status.toUpperCase()}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                !error && (
                  <tr>
                    <td colSpan={4} className="empty-state-row">
                      Nenhum registro financeiro encontrado.
                    </td>
                  </tr>
                )
              )}
            </tbody>
          </table>
        )}
      </section>
    </Layout>
  );
}