import { Request, Response } from 'express';
import { createUserClient } from '../config/supabase';
import { AppError } from '../errors/appError';

class ClienteController {

  async cadastrar(req: Request, res: Response) {
    try {
      const supabase = createUserClient(req.token!);
      const { nome, cpf_cnpj, telefone, cep, logradouro, numero, complemento, bairro, cidade, estado } = req.body;

      const { data, error } = await supabase
        .from('clientes')
        .insert([{
          nome,
          cpf_cnpj,
          telefone,
          cep,
          logradouro,
          numero,
          complemento,
          bairro,
          cidade,
          estado,
          user_id: req.user!.id
        }])
        .select()
        .single();

      if (error) throw new AppError(error.message, 400);

      return res.status(201).json({
        message: 'Cliente cadastrado com sucesso',
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
        .from('clientes')
        .select('*')
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
      const { nome, cpf_cnpj, telefone, cep, logradouro, numero, complemento, bairro, cidade, estado } = req.body;

      const { data, error } = await supabase
        .from('clientes')
        .update({ nome, cpf_cnpj, telefone, cep, logradouro, numero, complemento, bairro, cidade, estado })
        .eq('id', id)
        .select()
        .single();

      if (error) throw new AppError(error.message, 400);

      if (!data) {
        throw new AppError("Cliente não encontrado ou sem permissão para editar", 404);
      }

      return res.json({
        message: 'Cliente atualizado com sucesso',
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

      const { error, count } = await supabase
        .from('clientes')
        .delete({ count: 'exact' })
        .eq('id', id);

      if (error) throw new AppError(error.message, 400);

      if (count === 0) {
        throw new AppError("Cliente não encontrado ou sem permissão para excluir", 404);
      }

      return res.json({ message: 'Cliente removido com sucesso' });
    } catch (error: any) {
      const statusCode = error instanceof AppError ? error.statusCode : 500;
      return res.status(statusCode).json({ erro: error.message });
    }
  }
}

export default new ClienteController();