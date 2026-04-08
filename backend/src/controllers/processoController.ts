import { Request, Response } from 'express';
import { createUserClient } from '../config/supabase';
import { AppError } from '../errors/appError';

class ProcessoController {

  async cadastrar(req: Request, res: Response) {
    try {
      const supabase = createUserClient(req.token!);
      const { numero_processo, nome_partes, cliente_id, tipo, status } = req.body;

      const { data, error } = await supabase
        .from('processos')
        .insert([{ 
          numero_processo, 
          nome_partes, 
          cliente_id, 
          tipo, 
          status, 
          user_id: req.user!.id // Essencial para o RLS
        }])
        .select()
        .single(); // Retorna o objeto direto em vez de um array

      if (error) throw new AppError(error.message, 400);

      return res.status(201).json({
        message: 'Registro de processo criado com sucesso',
        data
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
        .from('processos')
        .select('*, clientes(nome)')
        .order('id', { ascending: true });

      if (error) throw new AppError(error.message, 400);

      return res.json(data);
    } catch (error: any) {
      return res.status(500).json({ erro: error.message });
    }
  }

  async editar(req: Request, res: Response) {
    try {
      const supabase = createUserClient(req.token!);
      const { id } = req.params;
      const { numero_processo, nome_partes, cliente_id, tipo, status } = req.body;

      const { data, error } = await supabase
        .from('processos')
        .update({ numero_processo, nome_partes, cliente_id, tipo, status })
        .eq('id', id)
        .select()
        .single();

      if (error) throw new AppError(error.message, 400);

      // Se o RLS bloqueou ou o ID não existe, data virá nulo
      if (!data) {
        throw new AppError("Registro não encontrado ou você não tem permissão para editá-lo", 404);
      }

      return res.json({
        message: 'Registro de processo atualizado com sucesso',
        data
      });
    } catch (error: any) {
      const statusCode = error instanceof AppError ? error.statusCode : 500;
      return res.status(statusCode).json({ erro: error.message });
    }
  }

  async remover(req: Request, res: Response) {
    try {
      const supabase = createUserClient(req.token!);
      const { id } = req.params;

      // No delete com RLS, se o ID não for do usuário, nada acontece.
      const { error, count } = await supabase
        .from('processos')
        .delete({ count: 'exact' }) // Pede a contagem para saber se deletou algo
        .eq('id', id);

      if (error) throw new AppError(error.message, 400);
      
      if (count === 0) {
        throw new AppError("Registro não encontrado ou sem permissão para excluir", 404);
      }

      return res.json({ message: 'Registro de processo removido com sucesso' });
    } catch (error: any) {
      const statusCode = error instanceof AppError ? error.statusCode : 500;
      return res.status(statusCode).json({ erro: error.message });
    }
  }
}

export default new ProcessoController();