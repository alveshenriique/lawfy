// =============================================================================
// TEMPLATE — este arquivo é versionado e NÃO contém segredos.
// O script real é `seed-demo.ts` (mesma pasta), ignorado pelo Git via .gitignore.
// Para usar: copie este arquivo para `seed-demo.ts` e preencha os placeholders.
//   cp scripts/seed-demo.example.ts scripts/seed-demo.ts
// Depois rode `npm run seed:demo` (ou `npm run seed:demo:reset`).
// =============================================================================

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_KEY!;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Variáveis SUPABASE_URL e SUPABASE_KEY são obrigatórias no .env');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const DEMO_EMAIL = 'demo@lawfy.com.br';
const DEMO_PASSWORD = 'COLOQUE_A_SENHA_AQUI';

function dataRelativa(meses: number): string {
  const d = new Date('2026-05-14');
  d.setMonth(d.getMonth() + meses);
  return d.toISOString().split('T')[0];
}

async function seed() {
  console.log('🌱 Iniciando seed do usuário demo...\n');

  // ── 1. Criar ou localizar o usuário demo ──────────────────────────────────
  let userId: string;

  const { data: { users }, error: listError } = await supabase.auth.admin.listUsers();
  if (listError) throw listError;

  const existing = users.find(u => u.email === DEMO_EMAIL);

  if (existing) {
    console.log(`✓ Usuário demo já existe: ${existing.id}`);
    userId = existing.id;

    const { data: clientesExistentes } = await supabase
      .from('clientes')
      .select('id')
      .eq('user_id', userId)
      .limit(1);

    if (clientesExistentes && clientesExistentes.length > 0) {
      if (!process.argv.includes('--reset')) {
        console.log('⚠️  Dados demo já existem. Use --reset para recriar do zero.\n');
        console.log('─────────────────────────────────');
        console.log(`  Email : ${DEMO_EMAIL}`);
        console.log(`  Senha : ${DEMO_PASSWORD}`);
        console.log('─────────────────────────────────\n');
        process.exit(0);
      }

      console.log('🗑️  Limpando dados demo anteriores...');
      await supabase.from('parcelas').delete().eq('user_id', userId);
      await supabase.from('financeiro').delete().eq('user_id', userId);
      await supabase.from('processos').delete().eq('user_id', userId);
      await supabase.from('clientes').delete().eq('user_id', userId);
      console.log('✓ Dados anteriores removidos.');
    }
  } else {
    const { data, error } = await supabase.auth.admin.createUser({
      email: DEMO_EMAIL,
      password: DEMO_PASSWORD,
      email_confirm: true,
      user_metadata: { nome: 'Escritório Demo' },
    });
    if (error) throw error;
    userId = data.user.id;
    console.log(`✓ Usuário demo criado: ${userId}`);
  }

  // ── 2. Clientes ───────────────────────────────────────────────────────────
  console.log('\n📋 Inserindo clientes...');

  const { data: clientes, error: clientesError } = await supabase
    .from('clientes')
    .insert([
      {
        nome: 'Ana Paula Ferreira',
        cpf_cnpj: '35291847806',
        telefone: '11987654321',
        cep: '01310-100',
        logradouro: 'Av. Paulista',
        numero: '1374',
        complemento: 'Sala 210',
        bairro: 'Bela Vista',
        cidade: 'São Paulo',
        estado: 'SP',
        user_id: userId,
      },
      {
        nome: 'Carlos Eduardo Mendes',
        cpf_cnpj: '48172956309',
        telefone: '11976543210',
        cep: '04538-132',
        logradouro: 'Rua Funchal',
        numero: '418',
        bairro: 'Itaim Bibi',
        cidade: 'São Paulo',
        estado: 'SP',
        user_id: userId,
      },
      {
        nome: 'Construtora Nova Era Ltda',
        cpf_cnpj: '12345678000195',
        telefone: '1132145678',
        cep: '01452-000',
        logradouro: 'Al. Santos',
        numero: '2224',
        bairro: 'Cerqueira César',
        cidade: 'São Paulo',
        estado: 'SP',
        user_id: userId,
      },
      {
        nome: 'Beatriz Lima Santos',
        cpf_cnpj: '65309214785',
        telefone: '21998765432',
        cep: '20040-020',
        logradouro: 'Av. Rio Branco',
        numero: '156',
        bairro: 'Centro',
        cidade: 'Rio de Janeiro',
        estado: 'RJ',
        user_id: userId,
      },
      {
        nome: 'Roberto Augusto Carvalho',
        cpf_cnpj: '79184052637',
        telefone: '31987654321',
        cep: '30112-000',
        logradouro: 'Av. Afonso Pena',
        numero: '1500',
        bairro: 'Centro',
        cidade: 'Belo Horizonte',
        estado: 'MG',
        user_id: userId,
      },
      {
        nome: 'Tech Solutions Brasil S.A.',
        cpf_cnpj: '98765432000112',
        telefone: '1134567890',
        cep: '06453-000',
        logradouro: 'Rod. Raposo Tavares',
        numero: 'km 22',
        bairro: 'Jd. Santa Terezinha',
        cidade: 'Cotia',
        estado: 'SP',
        user_id: userId,
      },
      {
        nome: 'Fernanda Cristina Oliveira',
        cpf_cnpj: '52847193026',
        telefone: '11954321098',
        cep: '04062-005',
        logradouro: 'Rua Vergueiro',
        numero: '3421',
        bairro: 'Vila Mariana',
        cidade: 'São Paulo',
        estado: 'SP',
        user_id: userId,
      },
      {
        nome: 'Marcos Antônio Pereira',
        cpf_cnpj: '31654782910',
        telefone: '11943218765',
        cep: '02040-000',
        logradouro: 'Rua Voluntários da Pátria',
        numero: '847',
        bairro: 'Santana',
        cidade: 'São Paulo',
        estado: 'SP',
        user_id: userId,
      },
    ])
    .select();

  if (clientesError) throw clientesError;
  console.log(`✓ ${clientes.length} clientes inseridos`);

  const c = Object.fromEntries(clientes.map(cl => [cl.nome, cl.id]));

  // ── 3. Processos ──────────────────────────────────────────────────────────
  console.log('\n⚖️  Inserindo processos...');

  const { data: processos, error: processosError } = await supabase
    .from('processos')
    .insert([
      {
        numero_processo: '1023456-78.2024.8.26.0100',
        nome_partes: 'Ana Paula Ferreira\nConstrutora Horizonte S.A.',
        cliente_id: c['Ana Paula Ferreira'],
        tipo: 'judicial',
        status: 'ativo',
        user_id: userId,
      },
      {
        numero_processo: '4532109-87.2024.8.26.0100',
        nome_partes: 'Ana Paula Ferreira\nConstrutora Horizonte S.A.\nTerceiro Réu: Engenharia Confiança Ltda',
        cliente_id: c['Ana Paula Ferreira'],
        tipo: 'judicial',
        status: 'ativo',
        user_id: userId,
      },
      {
        numero_processo: '0098765-43.2023.8.26.0100',
        nome_partes: 'Carlos Eduardo Mendes\nBanco Meridiano S.A.',
        cliente_id: c['Carlos Eduardo Mendes'],
        tipo: 'judicial',
        status: 'ativo',
        user_id: userId,
      },
      {
        numero_processo: null,
        nome_partes: 'Construtora Nova Era Ltda\nPrefeitura Municipal de São Paulo',
        cliente_id: c['Construtora Nova Era Ltda'],
        tipo: 'extrajudicial',
        status: 'ativo',
        user_id: userId,
      },
      {
        numero_processo: '5012345-67.2022.8.19.0001',
        nome_partes: 'Beatriz Lima Santos\nSeguros Nacional S.A.',
        cliente_id: c['Beatriz Lima Santos'],
        tipo: 'judicial',
        status: 'encerrado',
        user_id: userId,
      },
      {
        numero_processo: '3047821-90.2023.8.13.0024',
        nome_partes: 'Roberto Augusto Carvalho\nMetalmecânica Tangará Ltda',
        cliente_id: c['Roberto Augusto Carvalho'],
        tipo: 'judicial',
        status: 'ativo',
        user_id: userId,
      },
      {
        numero_processo: '7654321-01.2024.8.26.0100',
        nome_partes: 'Tech Solutions Brasil S.A.\nFornecedor Tecnológico Inovação Ltda',
        cliente_id: c['Tech Solutions Brasil S.A.'],
        tipo: 'judicial',
        status: 'ativo',
        user_id: userId,
      },
      {
        numero_processo: null,
        nome_partes: 'Tech Solutions Brasil S.A.\nColaboradores (Revisão de Contratos)',
        cliente_id: c['Tech Solutions Brasil S.A.'],
        tipo: 'extrajudicial',
        status: 'ativo',
        user_id: userId,
      },
      {
        numero_processo: '2109876-54.2022.8.26.0100',
        nome_partes: 'Fernanda Cristina Oliveira\nCondomínio Edifício Solar',
        cliente_id: c['Fernanda Cristina Oliveira'],
        tipo: 'judicial',
        status: 'arquivado',
        user_id: userId,
      },
      {
        numero_processo: '9001234-56.2024.8.26.0053',
        nome_partes: 'Marcos Antônio Pereira\nLocadora Veículos Rápidos Ltda',
        cliente_id: c['Marcos Antônio Pereira'],
        tipo: 'judicial',
        status: 'ativo',
        user_id: userId,
      },
    ])
    .select();

  if (processosError) throw processosError;
  console.log(`✓ ${processos.length} processos inseridos`);

  const p = Object.fromEntries(processos.map(pr => [pr.numero_processo ?? pr.nome_partes.split('\n')[0] + '_ext', pr.id]));

  // ── 4. Financeiro + Parcelas ──────────────────────────────────────────────
  console.log('\n💰 Inserindo lançamentos financeiros...');

  type Parcela = {
    valor_parcela: number;
    data_vencimento: string;
    pago: boolean;
    data_pagamento: string | null;
  };

  type Lancamento = {
    financeiro: {
      processo_id: number | null;
      tipo: string;
      valor_total: number;
      descricao: string;
      status: string;
      user_id: string;
    };
    parcelas: Parcela[];
  };

  const lancamentos: Lancamento[] = [
    {
      financeiro: {
        processo_id: p['1023456-78.2024.8.26.0100'],
        tipo: 'receita',
        valor_total: 18000,
        descricao: 'Honorários — Ação de Indenização por Danos',
        status: 'pago',
        user_id: userId,
      },
      parcelas: [
        { valor_parcela: 6000, data_vencimento: dataRelativa(-4), pago: true, data_pagamento: dataRelativa(-4) },
        { valor_parcela: 6000, data_vencimento: dataRelativa(-3), pago: true, data_pagamento: dataRelativa(-3) },
        { valor_parcela: 6000, data_vencimento: dataRelativa(-2), pago: true, data_pagamento: dataRelativa(-2) },
      ],
    },
    {
      financeiro: {
        processo_id: p['0098765-43.2023.8.26.0100'],
        tipo: 'receita',
        valor_total: 12000,
        descricao: 'Honorários — Revisão Contratual Bancária',
        status: 'pendente',
        user_id: userId,
      },
      parcelas: [
        { valor_parcela: 4000, data_vencimento: dataRelativa(-2), pago: true, data_pagamento: dataRelativa(-2) },
        { valor_parcela: 4000, data_vencimento: dataRelativa(-1), pago: true, data_pagamento: dataRelativa(-1) },
        { valor_parcela: 4000, data_vencimento: dataRelativa(1), pago: false, data_pagamento: null },
      ],
    },
    {
      financeiro: {
        processo_id: p['Construtora Nova Era Ltda_ext'],
        tipo: 'receita',
        valor_total: 25000,
        descricao: 'Consultoria Jurídica — Licenciamento Municipal',
        status: 'pendente',
        user_id: userId,
      },
      parcelas: [
        { valor_parcela: 5000, data_vencimento: dataRelativa(-4), pago: true, data_pagamento: dataRelativa(-4) },
        { valor_parcela: 5000, data_vencimento: dataRelativa(-3), pago: true, data_pagamento: dataRelativa(-3) },
        { valor_parcela: 5000, data_vencimento: dataRelativa(-1), pago: true, data_pagamento: dataRelativa(-1) },
        { valor_parcela: 5000, data_vencimento: dataRelativa(1), pago: false, data_pagamento: null },
        { valor_parcela: 5000, data_vencimento: dataRelativa(2), pago: false, data_pagamento: null },
      ],
    },
    {
      financeiro: {
        processo_id: p['7654321-01.2024.8.26.0100'],
        tipo: 'receita',
        valor_total: 32000,
        descricao: 'Honorários — Ação de Cobrança Empresarial',
        status: 'pendente',
        user_id: userId,
      },
      parcelas: [
        { valor_parcela: 8000, data_vencimento: dataRelativa(-5), pago: true, data_pagamento: dataRelativa(-5) },
        { valor_parcela: 8000, data_vencimento: dataRelativa(-4), pago: true, data_pagamento: dataRelativa(-4) },
        { valor_parcela: 8000, data_vencimento: dataRelativa(-1), pago: false, data_pagamento: null },
        { valor_parcela: 8000, data_vencimento: dataRelativa(2), pago: false, data_pagamento: null },
      ],
    },
    {
      financeiro: {
        processo_id: p['3047821-90.2023.8.13.0024'],
        tipo: 'receita',
        valor_total: 9600,
        descricao: 'Honorários — Reclamação Trabalhista',
        status: 'pendente',
        user_id: userId,
      },
      parcelas: [
        { valor_parcela: 3200, data_vencimento: dataRelativa(-2), pago: false, data_pagamento: null },
        { valor_parcela: 3200, data_vencimento: dataRelativa(1), pago: false, data_pagamento: null },
        { valor_parcela: 3200, data_vencimento: dataRelativa(3), pago: false, data_pagamento: null },
      ],
    },
    {
      financeiro: {
        processo_id: p['9001234-56.2024.8.26.0053'],
        tipo: 'receita',
        valor_total: 7500,
        descricao: 'Honorários — Ação de Indenização por Acidente',
        status: 'pendente',
        user_id: userId,
      },
      parcelas: [
        { valor_parcela: 2500, data_vencimento: dataRelativa(1), pago: false, data_pagamento: null },
        { valor_parcela: 2500, data_vencimento: dataRelativa(2), pago: false, data_pagamento: null },
        { valor_parcela: 2500, data_vencimento: dataRelativa(3), pago: false, data_pagamento: null },
      ],
    },
    {
      financeiro: {
        processo_id: null,
        tipo: 'despesa',
        valor_total: 4800,
        descricao: 'Aluguel do Escritório',
        status: 'pendente',
        user_id: userId,
      },
      parcelas: [
        { valor_parcela: 1600, data_vencimento: dataRelativa(-2), pago: true, data_pagamento: dataRelativa(-2) },
        { valor_parcela: 1600, data_vencimento: dataRelativa(-1), pago: true, data_pagamento: dataRelativa(-1) },
        { valor_parcela: 1600, data_vencimento: dataRelativa(0), pago: false, data_pagamento: null },
      ],
    },
    {
      financeiro: {
        processo_id: null,
        tipo: 'despesa',
        valor_total: 2400,
        descricao: 'Software Jurídico — Assinatura Anual',
        status: 'pago',
        user_id: userId,
      },
      parcelas: [
        { valor_parcela: 2400, data_vencimento: dataRelativa(-6), pago: true, data_pagamento: dataRelativa(-6) },
      ],
    },
  ];

  for (const lancamento of lancamentos) {
    const { data: fin, error: finError } = await supabase
      .from('financeiro')
      .insert([lancamento.financeiro])
      .select()
      .single();

    if (finError) throw finError;

    const { error: parcError } = await supabase
      .from('parcelas')
      .insert(lancamento.parcelas.map(p => ({ ...p, financeiro_id: fin.id, user_id: userId })));

    if (parcError) throw parcError;
  }

  console.log(`✓ ${lancamentos.length} lançamentos financeiros inseridos`);

  console.log('\n✅ Seed concluído!\n');
  console.log('─────────────────────────────────');
  console.log(`  Email : ${DEMO_EMAIL}`);
  console.log(`  Senha : ${DEMO_PASSWORD}`);
  console.log('─────────────────────────────────\n');
}

seed().catch(err => {
  console.error('\n❌ Erro no seed:', err.message ?? err);
  process.exit(1);
});
