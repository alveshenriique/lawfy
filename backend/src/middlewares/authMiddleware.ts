import { Request, Response, NextFunction } from 'express';
import { supabase } from '../config/supabase';

export const authMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  // 1. Pega o token que vem no cabeçalho (Header) da requisição
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({ erro: 'Token não fornecido' });
  }

  // O formato costuma ser "Bearer TOKEN", então pegamos só o token
  const token = authHeader.split(' ')[1];

  // 2. Pergunta ao Supabase: "Esse token é válido e de quem é?"
  const { data: { user }, error } = await supabase.auth.getUser(token);

  if (error || !user) {
    return res.status(401).json({ erro: 'Token inválido ou expirado' });
  }

  // 3. Salva o ID do usuário na requisição para os Controllers usarem depois!
  req.user = user; 

  // 4. Se chegou aqui, está tudo certo. Pode ir para o Controller!
  next();
};