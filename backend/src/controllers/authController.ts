import { Request, Response } from 'express';
import { supabase } from '../config/supabase';
import { AppError } from '../errors/appError';

class AuthController {
  
  // [POST] - Criar uma nova conta com Nome, E-mail e Senha
  async cadastrar(req: Request, res: Response) {
    const { email, password, nome } = req.body;

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: nome 
        }
      }
    });

    // Se houver erro no cadastro (ex: e-mail inválido), o AppError captura
    if (error) throw new AppError(error.message, 400);

    return res.status(201).json({ 
      mensagem: 'Usuário criado! Verifique seu e-mail.', 
      data 
    });
  }

  // [POST] - Fazer Login e receber o TOKEN (Chave Mestra)
  async login(req: Request, res: Response) {
    const { email, password } = req.body;

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    // Se o login falhar, lançamos um erro 401 (Não autorizado)
    if (error) throw new AppError('E-mail ou senha inválidos', 401);
    
    // Retorna o token e os dados básicos do usuário
    return res.json({
      mensagem: 'Login realizado com sucesso!',
      token: data.session?.access_token,
      usuario: {
        id: data.user?.id,
        email: data.user?.email,
        nome: data.user?.user_metadata?.full_name 
      }
    });
  }
}

export default new AuthController();