import { Request, Response } from 'express';
import { supabase } from '../config/supabase';
import { AppError } from '../errors/appError';

class DashboardController {
  async resumo(req: Request, res: Response) {
    const user_id = req.user!.id;

    // Total de clientes
    const { count: totalClientes, error: clienteError } = await supabase
      .from('clientes')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user_id);

    if (clienteError) throw new AppError(clienteError.message, 400);

    // Total de processos ativos
    const { count: processosAtivos, error: processoError } = await supabase
      .from('processos')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user_id)
      .eq('status', 'ativo');

    if (processoError) throw new AppError(processoError.message, 400);

    // Total de processos
    const { count: totalProcessos, error: totalProcessoError } = await supabase
      .from('processos')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user_id);

    if (totalProcessoError) throw new AppError(totalProcessoError.message, 400);

    // Valor total a receber (parcelas pendentes de receitas)
    const { data: parcelasPendentes, error: parcelasError } = await supabase
      .from('parcelas')
      .select('valor_parcela, financeiro!inner(tipo, user_id)')
      .eq('pago', false)
      .eq('financeiro.user_id', user_id)
      .eq('financeiro.tipo', 'receita');

    if (parcelasError) throw new AppError(parcelasError.message, 400);

    const valorAReceber = parcelasPendentes?.reduce(
      (acc, p) => acc + Number(p.valor_parcela), 0
    ) ?? 0;

    // Parcelas vencendo nos próximos 30 dias
    const hoje = new Date().toISOString().split('T')[0];
    const em30dias = new Date();
    em30dias.setDate(em30dias.getDate() + 30);
    const em30diasStr = em30dias.toISOString().split('T')[0];

    const { count: parcelasVencendo, error: vencendoError } = await supabase
      .from('parcelas')
      .select('*, financeiro!inner(user_id)', { count: 'exact', head: true })
      .eq('pago', false)
      .eq('financeiro.user_id', user_id)
      .gte('data_vencimento', hoje)
      .lte('data_vencimento', em30diasStr);

    if (vencendoError) throw new AppError(vencendoError.message, 400);

    return res.json({
      totalClientes: totalClientes ?? 0,
      processosAtivos: processosAtivos ?? 0,
      totalProcessos: totalProcessos ?? 0,
      valorAReceber,
      parcelasVencendo: parcelasVencendo ?? 0,
    });
  }
}

export default new DashboardController();