import { Request, Response, NextFunction } from 'express';
import { z, ZodError } from 'zod';

// Usamos z.ZodTypeAny para garantir compatibilidade total com o TypeScript
export const validate = (schema: z.ZodTypeAny) => 
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      // Validação do objeto que contém body, query e params
      await schema.parseAsync({
        body: req.body,
        query: req.query,
        params: req.params,
      });
      
      return next();
    } catch (error: unknown) {
      if (error instanceof ZodError) {
        // Retorno técnico padronizado para erros de validação
        return res.status(400).json({
          error: "Erro de validação nos dados enviados",
          details: error.issues.map((issue) => ({
            campo: issue.path[1] || issue.path[0],
            mensagem: issue.message
          }))
        });
      }
      
      return res.status(500).json({ error: "Erro interno no processamento da validação" });
    }
  };