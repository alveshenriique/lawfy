import { Request, Response } from 'express';
import { supabase } from '../config/supabase';
import { AppError } from '../errors/appError';

class FinanceiroController {

  async gerarContrato(req: Request, res: Response) {
    const { processo_id, tipo, valor_total, descricao, numero_parcelas } = req.body;

    const { data: financeiro, error: finError } = await supabase
      .from('financeiro')
      .insert([{ processo_id, tipo, valor_total, descricao, status: 'pendente' }])
      .select().single();

    if (finError) throw new AppError(finError.message, 400);

    const valorParcela = valor_total / numero_parcelas;
    const parcelasParaInserir = [];

    for (let i = 1; i <= numero_parcelas; i++) {
      const dataVencimento = new Date();
      dataVencimento.setMonth(dataVencimento.getMonth() + i);

      parcelasParaInserir.push({
        financeiro_id: financeiro.id,
        valor_parcela: valorParcela,
        data_vencimento: dataVencimento.toISOString().split('T')[0],
        pago: false
      });
    }

    const { error: parcError } = await supabase
      .from('parcelas')
      .insert(parcelasParaInserir);

    if (parcError) throw new AppError(parcError.message, 400);

    return res.status(201).json({
      message: 'Financeiro e parcelas gerados com sucesso',
      id_financeiro: financeiro.id
    });
  }

  // Parcelas ordenadas por data de vencimento — abertas primeiro, pagas depois
  async listar(req: Request, res: Response) {
    const { data, error } = await supabase
      .from('financeiro')
      .select('*, parcelas(*)')
      .order('id', { ascending: false });

    if (error) throw new AppError(error.message, 400);

    // Ordena as parcelas de cada financeiro: abertas por vencimento, pagas por último
    const dataOrdenada = data?.map(financeiro => ({
      ...financeiro,
      parcelas: (financeiro.parcelas ?? []).sort((a: any, b: any) => {
        if (a.pago !== b.pago) return a.pago ? 1 : -1;
        return new Date(a.data_vencimento).getTime() - new Date(b.data_vencimento).getTime();
      })
    }));

    return res.json(dataOrdenada);
  }

  // Quita parcela e verifica se todas estão pagas para atualizar status do financeiro
  async quitarParcela(req: Request, res: Response) {
    const { id } = req.params;
    const hoje = new Date().toISOString().split('T')[0];

    const { data, error } = await supabase
      .from('parcelas')
      .update({ pago: true, data_pagamento: hoje })
      .eq('id', id)
      .select()
      .single();

    if (error) throw new AppError(error.message, 400);
    if (!data) throw new AppError("Parcela não encontrada", 404);

    // Verifica se todas as parcelas do financeiro estão pagas
    const { data: parcelas, error: parcError } = await supabase
      .from('parcelas')
      .select('pago')
      .eq('financeiro_id', data.financeiro_id);

    if (parcError) throw new AppError(parcError.message, 400);

    const todasPagas = parcelas?.every(p => p.pago);

    // Se todas pagas, atualiza status do financeiro para 'pago'
    if (todasPagas) {
      const { error: finError } = await supabase
        .from('financeiro')
        .update({ status: 'pago' })
        .eq('id', data.financeiro_id);

      if (finError) throw new AppError(finError.message, 400);
    }

    return res.json({
      message: 'Pagamento registrado com sucesso',
      data,
      financeiro_quitado: todasPagas
    });
  }

  async remover(req: Request, res: Response) {
    const { id } = req.params;

    const { error } = await supabase
      .from('financeiro')
      .delete()
      .eq('id', id);

    if (error) throw new AppError(error.message, 400);

    return res.json({ message: 'Registro financeiro e dependências removidos com sucesso' });
  }
}

export default new FinanceiroController();