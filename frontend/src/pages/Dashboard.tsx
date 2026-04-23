import { Layout } from '../components/layout/Layout';
import { useAuth } from '../hooks/useAuth';
import { useDashboard } from '../hooks/useDashboard';
import { GoogleCalendarWidget } from '../components/ui/GoogleCalendarWidget';

export function Dashboard() {
  const { user } = useAuth();
  const { resumo, loading } = useDashboard();

  return (
    <Layout>
      <header className="dashboard-header">
        <h2 className="page-title">
          Olá, Dr. {user?.nome || 'Advogado'}
        </h2>
        <p className="page-subtitle">
          Acompanhe o status dos seus processos e prazos para hoje.
        </p>
      </header>

      <section className="stats-grid">
        <article className="stat-card">
          <p className="stat-label">Clientes Cadastrados</p>
          <h4 className="stat-value">
            {loading ? '...' : resumo?.totalClientes ?? 0}
          </h4>
          <span className="stat-indicator text-lawfy-text-soft">
            Total na base
          </span>
        </article>

        <article className="stat-card">
          <p className="stat-label">Processos Ativos</p>
          <h4 className="stat-value">
            {loading ? '...' : resumo?.processosAtivos ?? 0}
          </h4>
          <span className="stat-indicator text-lawfy-text-soft">
            {loading ? '...' : `${resumo?.totalProcessos ?? 0} processos no total`}
          </span>
        </article>

        <article className="stat-card">
          <p className="stat-label">Parcelas Vencendo</p>
          <h4 className={`stat-value ${(resumo?.parcelasVencendo ?? 0) > 0 ? 'text-lawfy-error' : ''}`}>
            {loading ? '...' : resumo?.parcelasVencendo ?? 0}
          </h4>
          <span className="stat-indicator text-lawfy-text-soft">
            Próximos 30 dias
          </span>
        </article>

        <article className="stat-card">
          <p className="stat-label">Valor a Receber</p>
          <h4 className="stat-value text-lawfy-success">
            {loading ? '...' : new Intl.NumberFormat('pt-BR', {
              style: 'currency',
              currency: 'BRL',
            }).format(resumo?.valorAReceber ?? 0)}
          </h4>
          <span className="stat-indicator text-lawfy-text-soft">
            Parcelas pendentes
          </span>
        </article>
      </section>

      {/* Google Calendar */}
      <div className="dashboard-calendar">
        <GoogleCalendarWidget />
      </div>
    </Layout>
  );
}