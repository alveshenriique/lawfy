import { Request, Response } from 'express';
import { supabase } from '../config/supabase';
import { AppError } from '../errors/appError';

class ProcessoController {

  async cadastrar(req: Request, res: Response) {
    const { numero_processo, nome_partes, cliente_id, tipo, status } = req.body;

    const { data, error } = await supabase
      .from('processos')
      .insert([{ numero_processo, nome_partes, cliente_id, tipo, status }])
      .select();

    if (error) throw new AppError(error.message, 400);

    return res.status(201).json({
      message: 'Registro de processo criado com sucesso',
      data
    });
  }

  async listar(req: Request, res: Response) {
    const { data, error } = await supabase
      .from('processos')
      .select('*, clientes(nome)')
      .order('id', { ascending: true });

    if (error) throw new AppError(error.message, 400);

    return res.json(data);
  }

  async editar(req: Request, res: Response) {
    const { id } = req.params;
    const { numero_processo, nome_partes, cliente_id, tipo, status } = req.body;

    const { data, error } = await supabase
      .from('processos')
      .update({ numero_processo, nome_partes, cliente_id, tipo, status })
      .eq('id', id)
      .select();

    if (error) throw new AppError(error.message, 400);

    if (!data || data.length === 0) {
      throw new AppError("Registro não encontrado", 404);
    }

    return res.json({
      message: 'Registro de processo atualizado com sucesso',
      data
    });
  }

  async remover(req: Request, res: Response) {
    const { id } = req.params;

    const { error } = await supabase
      .from('processos')
      .delete()
      .eq('id', id);

    if (error) throw new AppError(error.message, 400);

    return res.json({ message: 'Registro de processo removido com sucesso' });
  }
}

export default new ProcessoController();