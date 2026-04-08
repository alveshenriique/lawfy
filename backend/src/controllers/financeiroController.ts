import { Request, Response } from 'express';
import { createUserClient } from '../config/supabase';
import { AppError } from '../errors/appError';

class FinanceiroController {

  async gerarContrato(req: Request, res: Response) {
    try {
      const supabase = createUserClient(req.token!);
      const { processo_id, tipo, valor_total, descricao, numero_parcelas } = req.body;

      // Inserindo o registro pai com user_id
      const { data: financeiro, error: finError } = await supabase
        .from('financeiro')
        .insert([{ 
          processo_id, 
          tipo, 
          valor_total, 
          descricao, 
          status: 'pendente', 
          user_id: req.user!.id // Garante o dono do registro
        }])
        .select()
        .single();

      if (finError) throw new AppError(finError.message, 400);

      const valorParcela = valor_total / numero_parcelas;
      const parcelasParaInserir = [];

      for (let i = 1; i <= numero_parcelas; i++) {
        const dataVencimento = new Date();
        // Ajuste para vencimento mensal começando em 30 dias
        dataVencimento.setMonth(dataVencimento.getMonth() + i);

        parcelasParaInserir.push({
          financeiro_id: financeiro.id,
          valor_parcela: valorParcela,
          data_vencimento: dataVencimento.toISOString().split('T')[0],
          pago: false,
          user_id: req.user!.id, // Importante: parcelas também precisam de dono para o RLS funcionar nelas
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
    } catch (error: any) {
      const statusCode = error instanceof AppError ? error.statusCode : 500;
      return res.status(statusCode).json({ erro: error.message });
    }
  }

  async listar(req: Request, res: Response) {
    try {
      const supabase = createUserClient(req.token!);

      // O select traz os dados relacionados. O RLS filtrará tudo automaticamente.
      const { data, error } = await supabase
        .from('financeiro')
        .select('*, parcelas(*), processos(id, numero_processo, nome_partes, clientes(id, nome))')
        .order('id', { ascending: false });

      if (error) throw new AppError(error.message, 400);

      // Ordenação lógica das parcelas para exibição no frontend
      const dataOrdenada = data?.map(financeiro => ({
        ...financeiro,
        parcelas: (financeiro.parcelas ?? []).sort((a: any, b: any) => {
          if (a.pago !== b.pago) return a.pago ? 1 : -1;
          return new Date(a.data_vencimento).getTime() - new Date(b.data_vencimento).getTime();
        })
      }));

      return res.json(dataOrdenada);
    } catch (error: any) {
      return res.status(500).json({ erro: error.message });
    }
  }

  async editar(req: Request, res: Response) {
    try {
      const supabase = createUserClient(req.token!);
      const { id } = req.params;
      const { processo_id, tipo, valor_total, descricao, status } = req.body;

      // O .eq('id', id) com o cliente do usuário garante que ele só edite o que for dele
      const { data, error } = await supabase
        .from('financeiro')
        .update({ processo_id, tipo, valor_total, descricao, status })
        .eq('id', id)
        .select()
        .single();

      if (error) throw new AppError(error.message, 400);
      if (!data) throw new AppError('Registro não encontrado ou sem permissão', 404);

      return res.json({
        message: 'Lançamento atualizado com sucesso',
        data,
      });
    } catch (error: any) {
      const statusCode = error instanceof AppError ? error.statusCode : 500;
      return res.status(statusCode).json({ erro: error.message });
    }
  }

  async quitarParcela(req: Request, res: Response) {
    try {
      const supabase = createUserClient(req.token!);
      const { id } = req.params;
      const hoje = new Date().toISOString().split('T')[0];

      const { data, error } = await supabase
        .from('parcelas')
        .update({ pago: true, data_pagamento: hoje })
        .eq('id', id)
        .select()
        .single();

      if (error) throw new AppError(error.message, 400);
      if (!data) throw new AppError("Parcela não encontrada ou sem permissão", 404);

      // Verifica se todas as parcelas do contrato foram pagas
      const { data: parcelas, error: parcError } = await supabase
        .from('parcelas')
        .select('pago')
        .eq('financeiro_id', data.financeiro_id);

      if (parcError) throw new AppError(parcError.message, 400);

      const todasPagas = parcelas?.every(p => p.pago);

      if (todasPagas) {
        await supabase
          .from('financeiro')
          .update({ status: 'pago' })
          .eq('id', data.financeiro_id);
      }

      return res.json({
        message: 'Pagamento registrado com sucesso',
        data,
        financeiro_quitado: todasPagas
      });
    } catch (error: any) {
      return res.status(400).json({ erro: error.message });
    }
  }

  async editarParcela(req: Request, res: Response) {
    try {
      const supabase = createUserClient(req.token!);
      const { id } = req.params;
      const { valor_parcela, data_vencimento } = req.body;

      const { data, error } = await supabase
        .from('parcelas')
        .update({ valor_parcela, data_vencimento })
        .eq('id', id)
        .select()
        .single();

      if (error) throw new AppError(error.message, 400);
      if (!data) throw new AppError('Parcela não encontrada', 404);

      return res.json({
        message: 'Parcela atualizada com sucesso',
        data,
      });
    } catch (error: any) {
      return res.status(400).json({ erro: error.message });
    }
  }

  async remover(req: Request, res: Response) {
    try {
      const supabase = createUserClient(req.token!);
      const { id } = req.params;

      const { error } = await supabase
        .from('financeiro')
        .delete()
        .eq('id', id);

      if (error) throw new AppError(error.message, 400);

      return res.json({ message: 'Registro financeiro removido com sucesso' });
    } catch (error: any) {
      return res.status(400).json({ erro: error.message });
    }
  }
}

export default new FinanceiroController();