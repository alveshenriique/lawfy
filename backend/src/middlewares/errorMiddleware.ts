import { Request, Response, NextFunction } from 'express';
import { AppError } from '../errors/appError';
import { ZodError } from 'zod';

export const errorMiddleware = (
  error: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // Se for um erro que nós lançamos propositalmente
  if (error instanceof AppError) {
    return res.status(error.statusCode).json({
      status: 'error',
      message: error.message,
    });
  }

  // Se for um erro de validação do Zod que escapou do validateMiddleware
  if (error instanceof ZodError) {
    return res.status(400).json({
      status: 'validation_error',
      details: error.issues.map(i => i.message),
    });
  }

  // Erro inesperado (Bug, Banco fora, etc) - Logamos no console para o Dev ver
  console.error(' [SERVER ERROR]:', error);

  return res.status(500).json({
    status: 'error',
    message: 'Internal server error',
  });
};