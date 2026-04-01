import { Request, Response } from 'express';
import { supabase } from '../config/supabase';
import { AppError } from '../errors/appError';

class ClienteController {
  
  // Criação de novo registro de cliente
  async cadastrar(req: Request, res: Response) {
    const { nome, cpf_cnpj, telefone } = req.body;
    
    const { data, error } = await supabase
      .from('clientes')
      .insert([{ nome, cpf_cnpj, telefone }])
      .select();

    // Se houver erro no banco, lançamos para o middleware capturar
    if (error) throw new AppError(error.message, 400);
    
    return res.status(201).json({ 
      message: 'Registro criado com sucesso', 
      data 
    });
  }

  // Listagem de todos os registros
  async listar(req: Request, res: Response) {
    const { data, error } = await supabase
      .from('clientes')
      .select('*')
      .order('id', { ascending: true });

    if (error) throw new AppError(error.message, 400);
    
    return res.json(data);
  }

  // Atualização de dados de um registro específico via ID
  async editar(req: Request, res: Response) {
    const { id } = req.params;
    const { nome, cpf_cnpj, telefone } = req.body;

    const { data, error } = await supabase
      .from('clientes')
      .update({ nome, cpf_cnpj, telefone })
      .eq('id', id)
      .select();

    if (error) throw new AppError(error.message, 400);
    
    // Verificação de existência do registro
    if (!data || data.length === 0) {
      throw new AppError("Registro não encontrado", 404);
    }

    return res.json({ 
      message: 'Registro atualizado com sucesso', 
      data 
    });
  }

  // Remoção definitiva de um registro via ID
  async remover(req: Request, res: Response) {
    const { id } = req.params;
    
    const { error } = await supabase
      .from('clientes')
      .delete()
      .eq('id', id);

    if (error) throw new AppError(error.message, 400);
    
    return res.json({ message: 'Registro removido com sucesso' });
  }
}

export default new ClienteController();