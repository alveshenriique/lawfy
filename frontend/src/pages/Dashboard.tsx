import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell, Legend,
} from 'recharts';
import { Users, Scale, AlertCircle, TrendingUp } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Layout } from '../components/layout/Layout';
import { useAuth } from '../hooks/useAuth';
import { useDashboard } from '../hooks/useDashboard';
import { GoogleCalendarWidget } from '../components/ui/GoogleCalendarWidget';

const PIE_COLORS = ['#10b981', '#ef4444', '#94a3b8'];

const BRL = (v: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v);

function SkeletonBlock({ className }: { className?: string }) {
  return <div className={`skeleton ${className ?? ''}`} />;
}

function StatCardSkeleton() {
  return (
    <article className="stat-card">
      <div className="stat-card-top">
        <SkeletonBlock className="w-9 h-9 rounded-lg" />
        <SkeletonBlock className="h-3 w-24" />
      </div>
      <SkeletonBlock className="h-8 w-20 mt-1 mb-2" />
      <SkeletonBlock className="h-3 w-28" />
    </article>
  );
}

export function Dashboard() {
  const { user } = useAuth();
  const { resumo, loading } = useDashboard();
  const navigate = useNavigate();

  function getDiasRestantes(dataVencimento: string): number {
    const hoje = new Date();
    const vencimento = new Date(dataVencimento);
    return Math.ceil((vencimento.getTime() - hoje.getTime()) / (1000 * 60 * 60 * 24));
  }

  function getTagVencimento(dias: number) {
    if (dias <= 5) return { label: `Vence em ${dias}d`, classe: 'tag-vencimento-urgente' };
    if (dias <= 15) return { label: `Vence em ${dias}d`, classe: 'tag-vencimento-alerta' };
    return { label: `Vence em ${dias}d`, classe: 'tag-vencimento-ok' };
  }

  const pieData = [
    { name: 'Ativos', value: resumo?.processosAtivos ?? 0 },
    { name: 'Encerrados', value: resumo?.processosEncerrados ?? 0 },
    { name: 'Arquivados', value: resumo?.processosArquivados ?? 0 },
  ].filter(d => d.value > 0);

  return (
    <Layout>
      <header className="dashboard-header">
        <h2 className="page-title">
          Olá, Dr. {user?.nome || 'Advogado'}
        </h2>
        <p className="page-subtitle">Acompanhe o status do escritório para hoje.</p>
      </header>

      {/* Stat cards */}
      <p className="dashboard-section-label">Visão geral</p>
      <section className="stats-grid">
        {loading ? (
          <>
            <StatCardSkeleton />
            <StatCardSkeleton />
            <StatCardSkeleton />
            <StatCardSkeleton />
          </>
        ) : (
          <>
            <article className="stat-card stat-card-link" onClick={() => navigate('/clientes')}>
              <div className="stat-card-top">
                <div className="stat-icon stat-icon-blue"><Users size={18} /></div>
                <p className="stat-label">Clientes</p>
              </div>
              <h4 className="stat-value">{resumo?.totalClientes ?? 0}</h4>
              <span className="stat-indicator text-lawfy-text-soft">Ver todos →</span>
            </article>

            <article className="stat-card stat-card-link" onClick={() => navigate('/processos?status=ativo')}>
              <div className="stat-card-top">
                <div className="stat-icon stat-icon-teal"><Scale size={18} /></div>
                <p className="stat-label">Processos ativos</p>
              </div>
              <h4 className="stat-value">{resumo?.processosAtivos ?? 0}</h4>
              <span className="stat-indicator text-lawfy-text-soft">
                {resumo?.totalProcessos ?? 0} no total →
              </span>
            </article>

            <article className="stat-card stat-card-link" onClick={() => navigate('/financeiro?status=pendente')}>
              <div className="stat-card-top">
                <div className="stat-icon stat-icon-red"><AlertCircle size={18} /></div>
                <p className="stat-label">Parcelas vencendo</p>
              </div>
              <h4 className={`stat-value ${(resumo?.totalParcelasVencendo ?? 0) > 0 ? 'text-lawfy-error' : ''}`}>
                {resumo?.totalParcelasVencendo ?? 0}
              </h4>
              <span className="stat-indicator text-lawfy-text-soft">Próximos 30 dias →</span>
            </article>

            <article className="stat-card stat-card-link" onClick={() => navigate('/financeiro?tipo=receita&status=pendente')}>
              <div className="stat-card-top">
                <div className="stat-icon stat-icon-green"><TrendingUp size={18} /></div>
                <p className="stat-label">Valor a receber</p>
              </div>
              <h4 className="stat-value text-lawfy-success">
                {BRL(resumo?.valorAReceber ?? 0)}
              </h4>
              <span className="stat-indicator text-lawfy-text-soft">Ver lançamentos →</span>
            </article>
          </>
        )}
      </section>

      {/* Gráficos */}
      <div className="dashboard-charts-grid">
        {/* Fluxo financeiro mensal */}
        <div className="dashboard-chart-main">
          <p className="dashboard-section-label">Fluxo financeiro — últimos 6 meses</p>
          <div className="dashboard-panel p-5">
            {loading ? (
              <SkeletonBlock className="h-52 w-full rounded-lg" />
            ) : (
              <>
                <div className="dashboard-chart-legend">
                  <span className="dashboard-chart-legend-item dashboard-chart-legend-receita">Receitas</span>
                  <span className="dashboard-chart-legend-item dashboard-chart-legend-despesa">Despesas</span>
                </div>
                <ResponsiveContainer width="100%" height={200}>
                  <AreaChart
                    data={resumo?.financeiroPorMes ?? []}
                    margin={{ top: 5, right: 5, left: 0, bottom: 0 }}
                  >
                    <defs>
                      <linearGradient id="gradReceitas" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.25} />
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="gradDespesas" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#ef4444" stopOpacity={0.2} />
                        <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis dataKey="mes" tick={{ fontSize: 12, fill: '#64748b' }} axisLine={false} tickLine={false} />
                    <YAxis
                      tick={{ fontSize: 11, fill: '#64748b' }}
                      axisLine={false}
                      tickLine={false}
                      tickFormatter={(v) => v === 0 ? '0' : `R$${(v / 1000).toFixed(0)}k`}
                      width={52}
                    />
                    <Tooltip
                      contentStyle={{ borderRadius: '10px', border: '1px solid #e2e8f0', fontSize: 13 }}
                      formatter={(value, name) => [BRL(Number(value ?? 0)), name]}
                    />
                    <Area type="monotone" dataKey="receitas" name="Receitas" stroke="#10b981" strokeWidth={2} fill="url(#gradReceitas)" dot={false} />
                    <Area type="monotone" dataKey="despesas" name="Despesas" stroke="#ef4444" strokeWidth={2} fill="url(#gradDespesas)" dot={false} />
                  </AreaChart>
                </ResponsiveContainer>
              </>
            )}
          </div>
        </div>

        {/* Processos por status — donut */}
        <div>
          <p className="dashboard-section-label">Processos por status</p>
          <div className="dashboard-panel p-5 flex flex-col items-center justify-center" style={{ minHeight: 270 }}>
            {loading ? (
              <SkeletonBlock className="h-52 w-full rounded-lg" />
            ) : resumo?.totalProcessos === 0 ? (
              <p className="dashboard-panel-empty">Nenhum processo cadastrado.</p>
            ) : (
              <>
                <ResponsiveContainer width="100%" height={180}>
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={52}
                      outerRadius={76}
                      paddingAngle={3}
                      dataKey="value"
                    >
                      {pieData.map((_, i) => (
                        <Cell key={i} fill={PIE_COLORS[i]} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{ borderRadius: '10px', border: '1px solid #e2e8f0', fontSize: 13 }}
                    />
                    <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 12 }} />
                  </PieChart>
                </ResponsiveContainer>
                <p className="text-xs text-lawfy-text-soft mt-1">{resumo?.totalProcessos} processos no total</p>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Parcelas vencendo + Calendário */}
      <div className="dashboard-double-grid">
        <div>
          <p className="dashboard-section-label">Parcelas vencendo em breve</p>
          <div className="dashboard-panel">
            {loading ? (
              <div className="p-4 flex flex-col gap-3">
                {[1, 2, 3].map(i => (
                  <div key={i} className="flex justify-between items-center">
                    <div className="flex flex-col gap-1.5">
                      <SkeletonBlock className="h-3 w-36" />
                      <SkeletonBlock className="h-3 w-24" />
                    </div>
                    <SkeletonBlock className="h-5 w-20 rounded-full" />
                  </div>
                ))}
              </div>
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
                          {BRL(parcela.valor_parcela)}
                        </p>
                      </div>
                      <span className={`dashboard-tag ${tag.classe}`}>{tag.label}</span>
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
    </Layout>
  );
}
