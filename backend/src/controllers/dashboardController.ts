import { Request, Response } from 'express';
import { createUserClient } from '../config/supabase';
import { AppError } from '../errors/appError';

class DashboardController {
  async resumo(req: Request, res: Response) {
    try {
      const supabase = createUserClient(req.token!);

      // Total de clientes
      const { count: totalClientes, error: clienteError } = await supabase
        .from('clientes')
        .select('*', { count: 'exact', head: true });
      if (clienteError) throw new AppError(clienteError.message, 400);

      // Processos por status
      const { data: processos, error: processoError } = await supabase
        .from('processos')
        .select('status');
      if (processoError) throw new AppError(processoError.message, 400);

      const processosAtivos = processos?.filter(p => p.status === 'ativo').length ?? 0;
      const processosEncerrados = processos?.filter(p => p.status === 'encerrado').length ?? 0;
      const processosArquivados = processos?.filter(p => p.status === 'arquivado').length ?? 0;
      const totalProcessos = processos?.length ?? 0;

      // Valor a receber
      const { data: parcelasPendentes, error: parcelasError } = await supabase
        .from('parcelas')
        .select('valor_parcela, financeiro!inner(tipo)')
        .eq('pago', false)
        .eq('financeiro.tipo', 'receita');
      if (parcelasError) throw new AppError(parcelasError.message, 400);

      const valorAReceber = parcelasPendentes?.reduce(
        (acc, p) => acc + Number(p.valor_parcela), 0
      ) ?? 0;

      // Parcelas vencendo nos próximos 30 dias com detalhes
      const hoje = new Date().toISOString().split('T')[0];
      const em30dias = new Date();
      em30dias.setDate(em30dias.getDate() + 30);
      const em30diasStr = em30dias.toISOString().split('T')[0];

      const { data: parcelasVencendo, error: vencendoError } = await supabase
        .from('parcelas')
        .select(`
          id,
          valor_parcela,
          data_vencimento,
          financeiro!inner (
            tipo,
            descricao,
            processos (
              nome_partes,
              clientes (
                nome
              )
            )
          )
        `)
        .eq('pago', false)
        .gte('data_vencimento', hoje)
        .lte('data_vencimento', em30diasStr)
        .order('data_vencimento', { ascending: true })
        .limit(5);
      if (vencendoError) throw new AppError(vencendoError.message, 400);

      return res.json({
        totalClientes: totalClientes ?? 0,
        processosAtivos,
        processosEncerrados,
        processosArquivados,
        totalProcessos,
        valorAReceber,
        parcelasVencendo: parcelasVencendo ?? [],
        totalParcelasVencendo: parcelasVencendo?.length ?? 0,
      });

    } catch (error: any) {
      const statusCode = error instanceof AppError ? error.statusCode : 500;
      return res.status(statusCode).json({
        erro: error.message || 'Erro interno no dashboard'
      });
    }
  }
}

export default new DashboardController();