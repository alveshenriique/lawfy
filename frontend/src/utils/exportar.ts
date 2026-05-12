import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import type { Financeiro, Parcela } from '../types/financeiro';
import type { Cliente } from '../types/cliente';
import type { Processo } from '../types/processo';
import { formatCpfCnpj, formatTelefone } from './formatters';

function formatData(str: string) {
  const [year, month, day] = str.split('-');
  return `${day}/${month}/${year}`;
}

function formatMoeda(valor: number) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(valor);
}

// ─── CSV ─────────────────────────────────────────────────────────────────────

function downloadCSV(filename: string, rows: string[][]) {
  const bom = '﻿';
  const content = bom + rows.map(r => r.map(c => `"${c}"`).join(';')).join('\n');
  const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

// ─── PDF ─────────────────────────────────────────────────────────────────────

function criarPDF(titulo: string, colunas: string[], linhas: string[][]) {
  const doc = new jsPDF({ orientation: 'landscape' });
  doc.setFontSize(14);
  doc.text(titulo, 14, 16);
  doc.setFontSize(9);
  doc.text(`Gerado em ${new Date().toLocaleDateString('pt-BR')}`, 14, 22);
  autoTable(doc, {
    head: [colunas],
    body: linhas,
    startY: 26,
    styles: { fontSize: 8 },
    headStyles: { fillColor: [41, 79, 98] },
  });
  doc.save(`${titulo}.pdf`);
}

// ─── FINANCEIRO ──────────────────────────────────────────────────────────────

function parcelasParaLinhas(financeiros: Financeiro[], statusFiltro: string): string[][] {
  const linhas: string[][] = [];
  for (const f of financeiros) {
    for (const p of f.parcelas ?? []) {
      const vencimento = new Date(p.data_vencimento + 'T00:00:00');
      const hoje = new Date();
      hoje.setHours(0, 0, 0, 0);
      const vencido = !p.pago && vencimento < hoje;

      const statusParcela = p.pago ? 'Pago' : vencido ? 'Vencido' : 'Em aberto';

      if (statusFiltro === 'pago' && !p.pago) continue;
      if (statusFiltro === 'aberto' && (p.pago || vencido)) continue;
      if (statusFiltro === 'vencido' && !vencido) continue;

      linhas.push([
        f.processos?.clientes?.nome ?? '—',
        f.descricao,
        f.tipo === 'receita' ? 'Receita' : 'Despesa',
        formatData(p.data_vencimento),
        p.data_pagamento ? formatData(p.data_pagamento) : '—',
        formatMoeda(p.valor_parcela),
        statusParcela,
      ]);
    }
  }
  return linhas;
}

const colunasFinanceiro = ['Cliente', 'Descrição', 'Tipo', 'Vencimento', 'Pagamento', 'Valor', 'Status'];

export function exportarFinanceiroCSV(financeiros: Financeiro[], statusFiltro: string) {
  const linhas = parcelasParaLinhas(financeiros, statusFiltro);
  downloadCSV('relatorio-financeiro.csv', [colunasFinanceiro, ...linhas]);
}

export function exportarFinanceiroPDF(financeiros: Financeiro[], statusFiltro: string) {
  const linhas = parcelasParaLinhas(financeiros, statusFiltro);
  criarPDF('Relatório Financeiro', colunasFinanceiro, linhas);
}

// ─── CLIENTES ────────────────────────────────────────────────────────────────

function clientesParaLinhas(clientes: Cliente[]): string[][] {
  return clientes.map(c => [
    c.nome,
    formatCpfCnpj(c.cpf_cnpj),
    c.telefone ? formatTelefone(c.telefone) : '—',
    [c.logradouro, c.numero && `nº ${c.numero}`, c.bairro, c.cidade, c.estado].filter(Boolean).join(', ') || '—',
  ]);
}

const colunasClientes = ['Nome / Razão Social', 'CPF / CNPJ', 'Telefone', 'Endereço'];

export function exportarClientesCSV(clientes: Cliente[]) {
  downloadCSV('relatorio-clientes.csv', [colunasClientes, ...clientesParaLinhas(clientes)]);
}

export function exportarClientesPDF(clientes: Cliente[]) {
  criarPDF('Relatório de Clientes', colunasClientes, clientesParaLinhas(clientes));
}

// ─── PROCESSOS ───────────────────────────────────────────────────────────────

function processosParaLinhas(processos: Processo[]): string[][] {
  return processos.map(p => [
    p.clientes?.nome ?? '—',
    p.numero_processo ?? '—',
    p.nome_partes,
    p.tipo === 'judicial' ? 'Judicial' : 'Extrajudicial',
    p.status.charAt(0).toUpperCase() + p.status.slice(1),
    formatData(p.criado_em.split('T')[0]),
  ]);
}

const colunasProcessos = ['Cliente', 'Nº Processo', 'Partes', 'Tipo', 'Status', 'Cadastrado em'];

export function exportarProcessosCSV(processos: Processo[]) {
  downloadCSV('relatorio-processos.csv', [colunasProcessos, ...processosParaLinhas(processos)]);
}

export function exportarProcessosPDF(processos: Processo[]) {
  criarPDF('Relatório de Processos', colunasProcessos, processosParaLinhas(processos));
}
