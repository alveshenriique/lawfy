import { Request, Response } from 'express';
import { createUserClient } from '../config/supabase';
import { AppError } from '../errors/appError';

class DashboardController {
  async resumo(req: Request, res: Response) {
    // 1. Instancia o cliente com o token do usuário (Respeita RLS)
    const supabaseUser = createUserClient(req.token!);

    try {
      // TOTAL DE CLIENTES
      const { count: totalClientes, error: clienteError } = await supabaseUser
        .from('clientes')
        .select('*', { count: 'exact', head: true });

      if (clienteError) throw new AppError(clienteError.message, 400);

      // PROCESSOS ATIVOS
      const { count: processosAtivos, error: processoError } = await supabaseUser
        .from('processos')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'ativo');

      if (processoError) throw new AppError(processoError.message, 400);

      // TOTAL DE PROCESSOS
      const { count: totalProcessos, error: totalProcessoError } = await supabaseUser
        .from('processos')
        .select('*', { count: 'exact', head: true });

      if (totalProcessoError) throw new AppError(totalProcessoError.message, 400);

      // VALOR A RECEBER (Parcelas pendentes de receitas)
      // Ajuste na sintaxe do Select para evitar erro 400 com RLS
      const { data: parcelasPendentes, error: parcelasError } = await supabaseUser
        .from('parcelas')
        .select(`
          valor_parcela,
          financeiro!inner (
            tipo
          )
        `)
        .eq('pago', false)
        .eq('financeiro.tipo', 'receita');

      if (parcelasError) throw new AppError(parcelasError.message, 400);

      const valorAReceber = parcelasPendentes?.reduce(
        (acc, p) => acc + Number(p.valor_parcela), 0
      ) ?? 0;

      // PARCELAS VENCENDO (Próximos 30 dias)
      const hoje = new Date().toISOString().split('T')[0];
      const em30dias = new Date();
      em30dias.setDate(em30dias.getDate() + 30);
      const em30diasStr = em30dias.toISOString().split('T')[0];

      const { count: parcelasVencendo, error: vencendoError } = await supabaseUser
        .from('parcelas')
        .select('*', { count: 'exact', head: true })
        .eq('pago', false)
        .gte('data_vencimento', hoje)
        .lte('data_vencimento', em30diasStr);

      if (vencendoError) throw new AppError(vencendoError.message, 400);

      // RETORNO CONSOLIDADO
      return res.json({
        totalClientes: totalClientes ?? 0,
        processosAtivos: processosAtivos ?? 0,
        totalProcessos: totalProcessos ?? 0,
        valorAReceber,
        parcelasVencendo: parcelasVencendo ?? 0,
      });

    } catch (error: any) {
      // Captura erros inesperados ou lançados pelo AppError
      const statusCode = error instanceof AppError ? error.statusCode : 500;
      return res.status(statusCode).json({ 
        erro: error.message || 'Erro interno no dashboard' 
      });
    }
  }
}

export default new DashboardController();