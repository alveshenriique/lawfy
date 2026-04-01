import { Request, Response } from 'express';
import { supabase } from '../config/supabase';
import { AppError } from '../errors/appError'; 

class FinanceiroController {
  
  // Cria um registro financeiro e gera automaticamente as parcelas vinculadas
  async gerarContrato(req: Request, res: Response) {
    const { processo_id, tipo, valor_total, descricao, numero_parcelas } = req.body;

    // Persistência do registro principal na tabela financeiro
    const { data: financeiro, error: finError } = await supabase
      .from('financeiro')
      .insert([{ processo_id, tipo, valor_total, descricao, status: 'pendente' }])
      .select().single();

    if (finError) throw new AppError(finError.message, 400);

    // Cálculo e preparação do lote de parcelas para inserção
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

    // Inserção em lote (bulk insert) das parcelas
    const { error: parcError } = await supabase.from('parcelas').insert(parcelasParaInserir);
    
    if (parcError) throw new AppError(parcError.message, 400);

    return res.status(201).json({ 
      message: 'Financeiro e parcelas gerados com sucesso',
      id_financeiro: financeiro.id 
    });
  }

  // Listagem de registros financeiros com relacionamento de parcelas incluído
  async listar(req: Request, res: Response) {
    const { data, error } = await supabase
      .from('financeiro')
      .select('*, parcelas(*)')
      .order('id', { ascending: false });

    if (error) throw new AppError(error.message, 400);
    
    return res.json(data);
  }

  // Atualiza o status de uma parcela específica para 'pago'
  async quitarParcela(req: Request, res: Response) {
    const { id } = req.params;
    const hoje = new Date().toISOString().split('T')[0];

    const { data, error } = await supabase
      .from('parcelas')
      .update({ pago: true, data_pagamento: hoje })
      .eq('id', id)
      .select();

    if (error) throw new AppError(error.message, 400);
    
    if (!data || data.length === 0) {
      throw new AppError("Parcela não encontrada", 404);
    }

    return res.json({ 
      message: 'Pagamento registrado com sucesso', 
      data: data[0] 
    });
  }

  // Remoção de registro financeiro e dependências
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