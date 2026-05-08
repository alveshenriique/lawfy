import { Request, Response } from 'express';
import { supabase, createUserClient } from '../config/supabase';
import { AppError } from '../errors/appError';

class CompartilhamentoController {

  // GET /compartilhamento — IDs dos clientes que o usuário atual já compartilhou
  async meusCompartilhados(req: Request, res: Response) {
    const userClient = createUserClient(req.token!);

    // Busca apenas os clientes do próprio usuário
    const { data: clientes } = await userClient
      .from('clientes')
      .select('id')
      .eq('user_id', req.user!.id);

    if (!clientes || clientes.length === 0) return res.json([]);

    const clienteIds = clientes.map(c => Number(c.id));

    const { data: permissoes } = await supabase
      .from('cliente_permissoes')
      .select('cliente_id')
      .in('cliente_id', clienteIds);

    const ids = [...new Set((permissoes ?? []).map(p => p.cliente_id))];
    return res.json(ids);
  }

  // POST /clientes/:id/compartilhamento — compartilha com todos os outros usuários
  async compartilharComTodos(req: Request, res: Response) {
    const userClient = createUserClient(req.token!);
    const { id: clienteId } = req.params;

    const { data: cliente } = await userClient
      .from('clientes')
      .select('id, user_id')
      .eq('id', clienteId)
      .single();

    if (!cliente) throw new AppError('Cliente não encontrado', 404);
    if (cliente.user_id !== req.user!.id) {
      throw new AppError('Apenas o responsável pelo cliente pode compartilhá-lo', 403);
    }

    const { data: { users }, error: listErr } = await supabase.auth.admin.listUsers();
    if (listErr) throw new AppError('Erro ao buscar usuários', 500);

    const outros = users.filter(u => u.id !== req.user!.id);
    if (outros.length === 0) return res.json({ message: 'Nenhum outro usuário no sistema', usuarios: [] });

    const inserts = outros.map(u => ({ cliente_id: Number(clienteId), user_id: u.id }));

    const { error } = await supabase
      .from('cliente_permissoes')
      .upsert(inserts, { onConflict: 'cliente_id,user_id', ignoreDuplicates: true });

    if (error) throw new AppError(error.message, 400);

    return res.status(201).json({ message: 'Compartilhado com sucesso' });
  }

  // DELETE /clientes/:id/compartilhamento — remove todos os acessos
  async removerTodos(req: Request, res: Response) {
    const userClient = createUserClient(req.token!);
    const { id: clienteId } = req.params;

    const { data: cliente } = await userClient
      .from('clientes')
      .select('id, user_id')
      .eq('id', clienteId)
      .single();

    if (!cliente) throw new AppError('Cliente não encontrado', 404);
    if (cliente.user_id !== req.user!.id) {
      throw new AppError('Apenas o responsável pode remover acessos', 403);
    }

    const { error } = await supabase
      .from('cliente_permissoes')
      .delete()
      .eq('cliente_id', Number(clienteId));

    if (error) throw new AppError(error.message, 400);

    return res.json({ message: 'Compartilhamento removido' });
  }
}

export default new CompartilhamentoController();
