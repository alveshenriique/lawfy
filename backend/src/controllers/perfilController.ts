import { Request, Response } from 'express';
import { supabase, createCredentialCheckClient } from '../config/supabase';
import { AppError } from '../errors/appError';

class PerfilController {

  async atualizarNome(req: Request, res: Response) {
    try {
      const { nome } = req.body;

      if (!nome || nome.trim().length < 3) {
        throw new AppError('O nome deve ter pelo menos 3 caracteres', 400);
      }

      const { data, error } = await supabase.auth.admin.updateUserById(
        req.user!.id,
        { user_metadata: { full_name: nome } }
      );

      if (error) throw new AppError(error.message, 400);

      return res.json({
        message: 'Nome atualizado com sucesso',
        usuario: {
          id: data.user.id,
          email: data.user.email,
          nome: data.user.user_metadata?.full_name,
        }
      });
    } catch (error: any) {
      const statusCode = error instanceof AppError ? error.statusCode : 500;
      return res.status(statusCode).json({ erro: error.message });
    }
  }

  async atualizarSenha(req: Request, res: Response) {
    try {
      const { senha_atual, nova_senha } = req.body;

      if (!nova_senha || nova_senha.length < 6) {
        throw new AppError('A nova senha deve ter pelo menos 6 caracteres', 400);
      }

      // Verifica a senha atual tentando fazer login em um cliente descartável.
      // Nunca usar o cliente admin compartilhado aqui: o login deixaria uma sessão
      // guardada nele e as requisições seguintes passariam a rodar como este usuário.
      const verificador = createCredentialCheckClient();
      const { error: loginError } = await verificador.auth.signInWithPassword({
        email: req.user!.email!,
        password: senha_atual,
      });

      // 400 e não 401: o usuário está autenticado, só errou a confirmação.
      // Um 401 aqui faria o interceptor do frontend tratar como sessão expirada e deslogar.
      if (loginError) throw new AppError('Senha atual incorreta', 400);

      // Atualiza a senha
      const { error } = await supabase.auth.admin.updateUserById(
        req.user!.id,
        { password: nova_senha }
      );

      if (error) throw new AppError(error.message, 400);

      return res.json({ message: 'Senha atualizada com sucesso' });
    } catch (error: any) {
      const statusCode = error instanceof AppError ? error.statusCode : 500;
      return res.status(statusCode).json({ erro: error.message });
    }
  }
}

export default new PerfilController();