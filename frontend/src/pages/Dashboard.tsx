import { Layout } from '../components/layout/Layout';
import { useAuth } from '../hooks/useAuth';
import { useDashboard } from '../hooks/useDashboard';
import { GoogleCalendarWidget } from '../components/ui/GoogleCalendarWidget';

export function Dashboard() {
  const { user } = useAuth();
  const { resumo, loading } = useDashboard();

  function getDiasRestantes(dataVencimento: string): number {
    const hoje = new Date();
    const vencimento = new Date(dataVencimento);
    const diff = vencimento.getTime() - hoje.getTime();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  }

  function getTagVencimento(dias: number) {
    if (dias <= 5) return { label: `Vence em ${dias}d`, classe: 'tag-vencimento-urgente' };
    if (dias <= 15) return { label: `Vence em ${dias}d`, classe: 'tag-vencimento-alerta' };
    return { label: `Vence em ${dias}d`, classe: 'tag-vencimento-ok' };
  }

  return (
    <Layout>
      <header className="dashboard-header">
        <h2 className="page-title">
          Olá, Dr. {user?.nome || 'Advogado'}
        </h2>
        <p className="page-subtitle">
          Acompanhe o status do escritório para hoje.
        </p>
      </header>

      {/* Métricas principais */}
      <p className="dashboard-section-label">Visão geral</p>
      <section className="stats-grid">
        <article className="stat-card">
          <p className="stat-label">Clientes</p>
          <h4 className="stat-value">
            {loading ? '...' : resumo?.totalClientes ?? 0}
          </h4>
          <span className="stat-indicator text-lawfy-text-soft">
            Total na base
          </span>
        </article>

        <article className="stat-card">
          <p className="stat-label">Processos ativos</p>
          <h4 className="stat-value">
            {loading ? '...' : resumo?.processosAtivos ?? 0}
          </h4>
          <span className="stat-indicator text-lawfy-text-soft">
            {loading ? '...' : `${resumo?.totalProcessos ?? 0} no total`}
          </span>
        </article>

        <article className="stat-card">
          <p className="stat-label">Parcelas vencendo</p>
          <h4 className={`stat-value ${(resumo?.totalParcelasVencendo ?? 0) > 0 ? 'text-lawfy-error' : ''}`}>
            {loading ? '...' : resumo?.totalParcelasVencendo ?? 0}
          </h4>
          <span className="stat-indicator text-lawfy-text-soft">
            Próximos 30 dias
          </span>
        </article>

        <article className="stat-card">
          <p className="stat-label">Valor a receber</p>
          <h4 className="stat-value text-lawfy-success">
            {loading ? '...' : new Intl.NumberFormat('pt-BR', {
              style: 'currency',
              currency: 'BRL',
            }).format(resumo?.valorAReceber ?? 0)}
          </h4>
          <span className="stat-indicator text-lawfy-text-soft">
            Parcelas em aberto
          </span>
        </article>
      </section>

      {/* Parcelas vencendo + Calendário */}
      <div className="dashboard-double-grid">
        <div>
          <p className="dashboard-section-label">Parcelas vencendo em breve</p>
          <div className="dashboard-panel">
            {loading ? (
              <p className="dashboard-panel-empty">Carregando...</p>
            ) : resumo?.parcelasVencendo && resumo.parcelasVencendo.length > 0 ? (
              <ul className="dashboard-list">
                {resumo.parcelasVencendo.map(parcela => {
                  const dias = getDiasRestantes(parcela.data_vencimento);
                  const tag = getTagVencimento(dias);
                  return (
                    <li key={parcela.id} className="dashboard-list-item">
                      <div className="dashboard-list-info">
                        <p className="dashboard-list-title">
                          {parcela.financeiro?.processos?.clientes?.nome ?? '—'}
                        </p>
                        <p className="dashboard-list-sub">
                          {new Date(parcela.data_vencimento).toLocaleDateString('pt-BR')} —{' '}
                          {new Intl.NumberFormat('pt-BR', {
                            style: 'currency',
                            currency: 'BRL',
                          }).format(parcela.valor_parcela)}
                        </p>
                      </div>
                      <span className={`dashboard-tag ${tag.classe}`}>
                        {tag.label}
                      </span>
                    </li>
                  );
                })}
              </ul>
            ) : (
              <p className="dashboard-panel-empty">
                Nenhuma parcela vencendo nos próximos 30 dias.
              </p>
            )}
          </div>
        </div>

        <div>
          <p className="dashboard-section-label">Próximos compromissos</p>
          <GoogleCalendarWidget />
        </div>
      </div>

      {/* Processos por status */}
      <p className="dashboard-section-label">Processos por status</p>
      <div className="dashboard-panel">
        {loading ? (
          <p className="dashboard-panel-empty">Carregando...</p>
        ) : (
          <div className="dashboard-bars">
            <div className="dashboard-bar-row">
              <span className="dashboard-bar-label">Ativos</span>
              <div className="dashboard-bar-track">
                <div
                  className="dashboard-bar-fill dashboard-bar-fill-green"
                  style={{
                    width: resumo?.totalProcessos
                      ? `${(resumo.processosAtivos / resumo.totalProcessos) * 100}%`
                      : '0%'
                  }}
                />
              </div>
              <span className="dashboard-bar-value">{resumo?.processosAtivos ?? 0}</span>
            </div>
            <div className="dashboard-bar-row">
              <span className="dashboard-bar-label">Encerrados</span>
              <div className="dashboard-bar-track">
                <div
                  className="dashboard-bar-fill dashboard-bar-fill-red"
                  style={{
                    width: resumo?.totalProcessos
                      ? `${(resumo.processosEncerrados / resumo.totalProcessos) * 100}%`
                      : '0%'
                  }}
                />
              </div>
              <span className="dashboard-bar-value">{resumo?.processosEncerrados ?? 0}</span>
            </div>
            <div className="dashboard-bar-row">
              <span className="dashboard-bar-label">Arquivados</span>
              <div className="dashboard-bar-track">
                <div
                  className="dashboard-bar-fill dashboard-bar-fill-gray"
                  style={{
                    width: resumo?.totalProcessos
                      ? `${(resumo.processosArquivados / resumo.totalProcessos) * 100}%`
                      : '0%'
                  }}
                />
              </div>
              <span className="dashboard-bar-value">{resumo?.processosArquivados ?? 0}</span>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}