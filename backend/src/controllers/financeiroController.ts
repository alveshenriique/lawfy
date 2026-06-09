import { Request, Response } from 'express';
import { createUserClient } from '../config/supabase';
import { AppError } from '../errors/appError';

class FinanceiroController {

  async gerarContrato(req: Request, res: Response) {
    try {
      const supabase = createUserClient(req.token!);
      const { processo_id, tipo, valor_total, descricao, numero_parcelas } = req.body;

      const { data: financeiro, error: finError } = await supabase
        .from('financeiro')
        .insert([{ 
          processo_id, 
          tipo, 
          valor_total: Number(valor_total), 
          descricao, 
          status: 'pendente', 
          user_id: req.user!.id 
        }])
        .select()
        .single();

      if (finError) throw new AppError(finError.message, 400);

      const valorParcela = Number(valor_total) / Number(numero_parcelas);
      const parcelasParaInserir = [];

      for (let i = 1; i <= numero_parcelas; i++) {
        const dataVencimento = new Date();
        dataVencimento.setMonth(dataVencimento.getMonth() + i);

        parcelasParaInserir.push({
          financeiro_id: financeiro.id,
          valor_parcela: valorParcela,
          data_vencimento: dataVencimento.toISOString().split('T')[0],
          pago: false,
          user_id: req.user!.id,
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

      const { data, error } = await supabase
        .from('financeiro')
        .select('*, parcelas(*), processos(id, numero_processo, nome_partes, clientes(id, nome))')
        .order('id', { ascending: false });

      if (error) throw new AppError(error.message, 400);

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
      const { processo_id, tipo, valor_total, descricao, status, numero_parcelas } = req.body;

      const { data, error } = await supabase
        .from('financeiro')
        .update({ processo_id, tipo, valor_total: Number(valor_total), descricao, status })
        .eq('id', id)
        .select()
        .single();

      if (error) throw new AppError(error.message, 400);
      if (!data) throw new AppError('Registro não encontrado ou sem permissão', 404);

      const { data: parcelas } = await supabase
        .from('parcelas')
        .select('*')
        .eq('financeiro_id', id)
        .order('data_vencimento', { ascending: true });

      const pagas = (parcelas ?? []).filter((p: any) => p.pago);
      const naoPagas = (parcelas ?? []).filter((p: any) => !p.pago);

      if (numero_parcelas) {
        const novasNaoPagas = Number(numero_parcelas) - pagas.length;

        if (novasNaoPagas < 0) {
          throw new AppError('O número de parcelas não pode ser menor que as já pagas.', 400);
        }

        if (naoPagas.length > 0) {
          await supabase
            .from('parcelas')
            .delete()
            .in('id', naoPagas.map((p: any) => p.id));
        }

        if (novasNaoPagas > 0) {
          const totalPago = pagas.reduce((acc: number, p: any) => acc + Number(p.valor_parcela), 0);
          const saldoRestante = Number(valor_total) - totalPago;
          const valorPorParcela = saldoRestante / novasNaoPagas;

          const dataBase = pagas.length > 0
            ? new Date(pagas[pagas.length - 1].data_vencimento + 'T00:00:00')
            : new Date();

          const novasParcelas = Array.from({ length: novasNaoPagas }, (_, i) => {
            const dataVencimento = new Date(dataBase);
            dataVencimento.setMonth(dataVencimento.getMonth() + (i + 1));
            return {
              financeiro_id: Number(id),
              valor_parcela: valorPorParcela,
              data_vencimento: dataVencimento.toISOString().split('T')[0],
              pago: false,
              user_id: req.user!.id,
            };
          });

          await supabase.from('parcelas').insert(novasParcelas);
        } else if (novasNaoPagas === 0 && pagas.length > 0) {
          // Nenhuma parcela nova criada e todas já estão pagas — sincroniza valor com o novo total
          const totalAtual = pagas.reduce((acc: number, p: any) => acc + Number(p.valor_parcela), 0);
          const novoTotal = Number(valor_total);
          if (Math.abs(totalAtual - novoTotal) > 0.01) {
            const fator = novoTotal / totalAtual;
            for (const p of pagas) {
              await supabase
                .from('parcelas')
                .update({ valor_parcela: Number((Number(p.valor_parcela) * fator).toFixed(2)) })
                .eq('id', p.id);
            }
          }
        }
      }

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
      const { pago, data_pagamento } = req.body;

      const hoje = new Date().toISOString().split('T')[0];

      const { data, error } = await supabase
        .from('parcelas')
        .update({
          pago: pago,
          data_pagamento: pago ? (data_pagamento ?? hoje) : null
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw new AppError(error.message, 400);
      if (!data) throw new AppError("Parcela não encontrada ou sem permissão", 404);

      const { data: parcelas, error: parcError } = await supabase
        .from('parcelas')
        .select('pago')
        .eq('financeiro_id', data.financeiro_id);

      if (parcError) throw new AppError(parcError.message, 400);

      const todasPagas = parcelas?.every(p => p.pago);
      const novoStatusFinanceiro = todasPagas ? 'pago' : 'pendente';

      await supabase
        .from('financeiro')
        .update({ status: novoStatusFinanceiro })
        .eq('id', data.financeiro_id);

      return res.json({
        message: pago ? 'Pagamento registrado com sucesso' : 'Pagamento desfeito com sucesso',
        data,
        financeiro_status: novoStatusFinanceiro
      });
    } catch (error: any) {
      return res.status(400).json({ erro: error.message });
    }
  }

  async editarParcela(req: Request, res: Response) {
    try {
      const supabase = createUserClient(req.token!);
      const { id } = req.params;
      const { valor_parcela, data_vencimento, data_pagamento } = req.body;

      // 1. Busca dados da parcela e do financeiro pai
      const { data: atual, error: errBusca } = await supabase
        .from('parcelas')
        .select('*, financeiro(valor_total)')
        .eq('id', id)
        .single();

      if (errBusca || !atual) throw new AppError("Parcela não encontrada", 404);

      if (atual.pago) {
        const { error } = await supabase
          .from('parcelas')
          .update({
            valor_parcela: Number(valor_parcela),
            data_pagamento: data_pagamento ?? atual.data_pagamento,
          })
          .eq('id', id);

        if (error) throw new AppError(error.message, 400);
        return res.json({ message: 'Parcela atualizada', reequilibrado: false });
      }

      // VERIFICAÇÃO CRUCIAL: O valor realmente mudou?
      // Se apenas a data mudou, o 'valorAlterado' será false.
      const valorAlterado = Number(atual.valor_parcela) !== Number(valor_parcela);

      // 2. Atualiza a parcela editada (Sempre atualiza, seja data ou valor)
      await supabase
        .from('parcelas')
        .update({ valor_parcela: Number(valor_parcela), data_vencimento })
        .eq('id', id);

      // 3. REEQUILÍBRIO: Só executa se o VALOR da parcela foi mexido
      if (valorAlterado) {
        const { data: todas, error: errTodas } = await supabase
          .from('parcelas')
          .select('id, valor_parcela, pago')
          .eq('financeiro_id', atual.financeiro_id);

        if (errTodas || !todas) throw new AppError("Erro ao buscar parcelas para reequilíbrio", 400);

        const totalContrato = Number(atual.financeiro.valor_total);
        
        // Soma o que já está pago
        const totalJaPago = todas
          .filter(p => p.pago)
          .reduce((acc, p) => acc + Number(p.valor_parcela), 0);

        const novoValorDestaParcela = Number(valor_parcela);

        // Identifica as outras parcelas que ainda estão em aberto (não pagas e não são a atual)
        const parcelasParaAjustar = todas
          .filter(p => !p.pago && p.id !== Number(id));

        if (parcelasParaAjustar.length > 0) {
          const saldoRestante = totalContrato - totalJaPago - novoValorDestaParcela;
          const valorRateado = saldoRestante / parcelasParaAjustar.length;

          // Atualiza as outras parcelas uma por uma
          for (const p of parcelasParaAjustar) {
            await supabase
              .from('parcelas')
              .update({ valor_parcela: valorRateado })
              .eq('id', p.id);
          }
        }
      }

      return res.json({ 
        message: valorAlterado ? 'Parcela e saldo atualizados' : 'Data da parcela atualizada',
        reequilibrado: valorAlterado
      });
    } catch (error: any) {
      const statusCode = error instanceof AppError ? error.statusCode : 400;
      return res.status(statusCode).json({ erro: error.message });
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