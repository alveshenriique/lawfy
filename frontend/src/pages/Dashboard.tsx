import { Layout } from '../components/layout/Layout';
import { useAuth } from '../hooks/useAuth';

/**
 * Dashboard (Camada de Composição).
 * * Responsabilidade Única: Orquestrar a exibição dos indicadores de negócio.
 * Estilização: 100% delegada às classes de utilidade do global.css.
 * Lógica: Consome dados do hook useAuth.
 */
export function Dashboard() {
  const { user } = useAuth();

  return (
    <Layout>
      {/* Cabeçalho da Página */}
      <header className="dashboard-header">
        <h2 className="page-title">
          Olá, Dr. {user?.nome || 'Advogado'}
        </h2>
        <p className="page-subtitle">
          Acompanhe o status dos seus processos e prazos para hoje.
        </p>
      </header>

      {/* Grade de Indicadores Financeiros/Processuais */}
      <section className="stats-grid">
        {/* Card: Processos */}
        <article className="stat-card">
          <p className="stat-label">Processos Ativos</p>
          <h4 className="stat-value">24</h4>
          <span className="stat-indicator text-lawfy-success">
            +3 desde o último mês
          </span>
        </article>

        {/* Card: Prazos */}
        <article className="stat-card">
          <p className="stat-label">Prazos Próximos</p>
          <h4 className="stat-value text-lawfy-error">08</h4>
          <span className="stat-indicator text-gray-400">
            Verificar agenda hoje
          </span>
        </article>

        {/* Card: Clientes */}
        <article className="stat-card">
          <p className="stat-label">Clientes Cadastrados</p>
          <h4 className="stat-value text-gray-800">112</h4>
          <span className="stat-indicator text-lawfy-primary">
            Painel Gerencial Lawfy
          </span>
        </article>
      </section>
    </Layout>
  );
}