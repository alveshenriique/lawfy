import { useState, useMemo } from 'react';
import { FileDown, Users, Scale, Wallet } from 'lucide-react';
import { Layout } from '../components/layout/Layout';
import { useFinanceiro } from '../hooks/useFinanceiro';
import { useClientes } from '../hooks/useClientes';
import { useProcessos } from '../hooks/useProcessos';
import { formatCpfCnpj, formatTelefone } from '../utils/formatters';
import {
  exportarFinanceiroCSV, exportarFinanceiroPDF,
  exportarClientesCSV, exportarClientesPDF,
  exportarProcessosCSV, exportarProcessosPDF,
} from '../utils/exportar';

function formatMoeda(v: number) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v);
}
function formatData(str: string) {
  const [y, m, d] = str.split('-');
  return `${d}/${m}/${y}`;
}

export function Relatorios() {
  const { financeiros, loading: loadingFin } = useFinanceiro();
  const { clientes, loading: loadingCli } = useClientes();
  const { processos, loading: loadingProc } = useProcessos();

  const [statusFin, setStatusFin] = useState('');
  const [tipoFin, setTipoFin] = useState('');
  const [searchCli, setSearchCli] = useState('');
  const [statusProc, setStatusProc] = useState('');
  const [tipoProc, setTipoProc] = useState('');

  const parcelasFiltradas = useMemo(() => {
    const resultado: Array<{
      cliente: string; descricao: string; tipo: string;
      vencimento: string; pagamento: string; valor: number; status: string;
    }> = [];

    for (const f of financeiros) {
      if (tipoFin && f.tipo !== tipoFin) continue;
      for (const p of f.parcelas ?? []) {
        const vencimento = new Date(p.data_vencimento + 'T00:00:00');
        const hoje = new Date(); hoje.setHours(0, 0, 0, 0);
        const vencido = !p.pago && vencimento < hoje;
        const statusParcela = p.pago ? 'pago' : vencido ? 'vencido' : 'aberto';
        if (statusFin && statusParcela !== statusFin) continue;
        resultado.push({
          cliente: f.processos?.clientes?.nome ?? '—',
          descricao: f.descricao,
          tipo: f.tipo === 'receita' ? 'Receita' : 'Despesa',
          vencimento: formatData(p.data_vencimento),
          pagamento: p.data_pagamento ? formatData(p.data_pagamento) : '—',
          valor: p.valor_parcela,
          status: statusParcela === 'pago' ? 'Pago' : statusParcela === 'vencido' ? 'Vencido' : 'Em aberto',
        });
      }
    }
    return resultado;
  }, [financeiros, statusFin, tipoFin]);

  const clientesFiltrados = useMemo(() => {
    if (!searchCli.trim()) return clientes;
    return clientes.filter(c =>
      c.nome.toLowerCase().includes(searchCli.toLowerCase()) ||
      c.cpf_cnpj.replace(/\D/g, '').includes(searchCli.replace(/\D/g, ''))
    );
  }, [clientes, searchCli]);

  const processosFiltrados = useMemo(() => {
    return processos.filter(p => {
      if (statusProc && p.status !== statusProc) return false;
      if (tipoProc && p.tipo !== tipoProc) return false;
      return true;
    });
  }, [processos, statusProc, tipoProc]);

  const finParaExport = useMemo(() => {
    return financeiros.filter(f => !tipoFin || f.tipo === tipoFin);
  }, [financeiros, tipoFin]);

  return (
    <Layout>
      <header className="page-header-actions">
        <div>
          <h2 className="page-title">Relatórios</h2>
          <p className="page-subtitle">Exporte dados filtrados em CSV ou PDF.</p>
        </div>
      </header>

      <div className="flex flex-col gap-6">

        {/* ── CLIENTES ── */}
        <div className="table-container p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Users size={18} className="text-lawfy-primary" />
              <h3 className="text-base font-semibold text-lawfy-text">Clientes</h3>
            </div>
            <div className="flex gap-2">
              <button className="btn-export" onClick={() => exportarClientesCSV(clientesFiltrados)}>
                <FileDown size={14} className="inline mr-1" />CSV
              </button>
              <button className="btn-export" onClick={() => exportarClientesPDF(clientesFiltrados)}>
                <FileDown size={14} className="inline mr-1" />PDF
              </button>
            </div>
          </div>

          <div className="flex gap-3 mb-4 max-w-sm">
            <input
              type="text"
              className="search-input"
              placeholder="Buscar por nome ou CPF/CNPJ..."
              value={searchCli}
              onChange={e => setSearchCli(e.target.value)}
            />
          </div>

          {loadingCli ? (
            <p className="text-sm text-lawfy-text-soft py-4 text-center">Carregando...</p>
          ) : (
            <table className="lawfy-table">
              <thead className="table-header">
                <tr>
                  <th className="table-header-cell">Nome / Razão Social</th>
                  <th className="table-header-cell">CPF / CNPJ</th>
                  <th className="table-header-cell">Telefone</th>
                  <th className="table-header-cell">Endereço</th>
                </tr>
              </thead>
              <tbody>
                {clientesFiltrados.length > 0 ? clientesFiltrados.map(c => (
                  <tr key={c.id} className="table-row">
                    <td className="table-cell-main">{c.nome}</td>
                    <td className="table-cell-secondary">{formatCpfCnpj(c.cpf_cnpj)}</td>
                    <td className="table-cell-data">{c.telefone ? formatTelefone(c.telefone) : '—'}</td>
                    <td className="table-cell-secondary">
                      {[c.logradouro, c.numero && `nº ${c.numero}`, c.bairro, c.cidade, c.estado].filter(Boolean).join(', ') || '—'}
                    </td>
                  </tr>
                )) : (
                  <tr><td colSpan={4} className="text-center text-sm text-lawfy-text-soft py-6">Nenhum cliente encontrado.</td></tr>
                )}
              </tbody>
            </table>
          )}
        </div>

        {/* ── PROCESSOS ── */}
        <div className="table-container p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Scale size={18} className="text-lawfy-primary" />
              <h3 className="text-base font-semibold text-lawfy-text">Processos</h3>
            </div>
            <div className="flex gap-2">
              <button className="btn-export" onClick={() => exportarProcessosCSV(processosFiltrados)}>
                <FileDown size={14} className="inline mr-1" />CSV
              </button>
              <button className="btn-export" onClick={() => exportarProcessosPDF(processosFiltrados)}>
                <FileDown size={14} className="inline mr-1" />PDF
              </button>
            </div>
          </div>

          <div className="flex gap-3 mb-4 flex-wrap max-w-sm">
            <select className="search-filter" value={statusProc} onChange={e => setStatusProc(e.target.value)}>
              <option value="">Todos os status</option>
              <option value="ativo">Ativo</option>
              <option value="arquivado">Arquivado</option>
              <option value="encerrado">Encerrado</option>
            </select>
            <select className="search-filter" value={tipoProc} onChange={e => setTipoProc(e.target.value)}>
              <option value="">Todos os tipos</option>
              <option value="judicial">Judicial</option>
              <option value="extrajudicial">Extrajudicial</option>
            </select>
          </div>

          {loadingProc ? (
            <p className="text-sm text-lawfy-text-soft py-4 text-center">Carregando...</p>
          ) : (
            <table className="lawfy-table">
              <thead className="table-header">
                <tr>
                  <th className="table-header-cell">Cliente</th>
                  <th className="table-header-cell">Nº Processo</th>
                  <th className="table-header-cell">Partes</th>
                  <th className="table-header-cell">Tipo</th>
                  <th className="table-header-cell text-center">Status</th>
                  <th className="table-header-cell">Cadastrado em</th>
                </tr>
              </thead>
              <tbody>
                {processosFiltrados.length > 0 ? processosFiltrados.map(p => (
                  <tr key={p.id} className="table-row">
                    <td className="table-cell-main">{p.clientes?.nome ?? '—'}</td>
                    <td className="table-cell-secondary">{p.numero_processo ?? '—'}</td>
                    <td className="table-cell-secondary">{p.nome_partes}</td>
                    <td className="table-cell-data capitalize">{p.tipo}</td>
                    <td className="table-cell text-center">
                      <span className={`badge-status-processo badge-status-${p.status}`}>
                        {p.status.toUpperCase()}
                      </span>
                    </td>
                    <td className="table-cell-data">{formatData(p.criado_em.split('T')[0])}</td>
                  </tr>
                )) : (
                  <tr><td colSpan={6} className="text-center text-sm text-lawfy-text-soft py-6">Nenhum processo encontrado.</td></tr>
                )}
              </tbody>
            </table>
          )}
        </div>

        {/* ── FINANCEIRO ── */}
        <div className="table-container p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Wallet size={18} className="text-lawfy-primary" />
              <h3 className="text-base font-semibold text-lawfy-text">Financeiro</h3>
            </div>
            <div className="flex gap-2">
              <button className="btn-export" onClick={() => exportarFinanceiroCSV(finParaExport, statusFin)}>
                <FileDown size={14} className="inline mr-1" />CSV
              </button>
              <button className="btn-export" onClick={() => exportarFinanceiroPDF(finParaExport, statusFin)}>
                <FileDown size={14} className="inline mr-1" />PDF
              </button>
            </div>
          </div>

          <div className="flex gap-3 mb-4 flex-wrap max-w-sm">
            <select className="search-filter" value={statusFin} onChange={e => setStatusFin(e.target.value)}>
              <option value="">Todos os status</option>
              <option value="aberto">Em aberto</option>
              <option value="pago">Pago</option>
              <option value="vencido">Vencido</option>
            </select>
            <select className="search-filter" value={tipoFin} onChange={e => setTipoFin(e.target.value)}>
              <option value="">Todos os tipos</option>
              <option value="receita">Receita</option>
              <option value="despesa">Despesa</option>
            </select>
          </div>

          {loadingFin ? (
            <p className="text-sm text-lawfy-text-soft py-4 text-center">Carregando...</p>
          ) : (
            <table className="lawfy-table">
              <thead className="table-header">
                <tr>
                  <th className="table-header-cell">Cliente</th>
                  <th className="table-header-cell">Descrição</th>
                  <th className="table-header-cell">Tipo</th>
                  <th className="table-header-cell">Vencimento</th>
                  <th className="table-header-cell">Pagamento</th>
                  <th className="table-header-cell text-right">Valor</th>
                  <th className="table-header-cell text-center">Status</th>
                </tr>
              </thead>
              <tbody>
                {parcelasFiltradas.length > 0 ? parcelasFiltradas.map((p, i) => (
                  <tr key={i} className="table-row">
                    <td className="table-cell-main">{p.cliente}</td>
                    <td className="table-cell-secondary">{p.descricao}</td>
                    <td className="table-cell-secondary">{p.tipo}</td>
                    <td className="table-cell-data">{p.vencimento}</td>
                    <td className="table-cell-data">{p.pagamento}</td>
                    <td className="table-cell-data text-right font-semibold">{formatMoeda(p.valor)}</td>
                    <td className="table-cell text-center">
                      <span className={`badge-status-processo ${
                        p.status === 'Pago' ? 'badge-status-pago' :
                        p.status === 'Vencido' ? 'badge-status-encerrado' :
                        'badge-status-pendente'
                      }`}>
                        {p.status.toUpperCase()}
                      </span>
                    </td>
                  </tr>
                )) : (
                  <tr><td colSpan={7} className="text-center text-sm text-lawfy-text-soft py-6">Nenhum registro encontrado.</td></tr>
                )}
              </tbody>
            </table>
          )}
        </div>

      </div>
    </Layout>
  );
}
