import 'express-async-errors';
import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import { authRoutes } from './routes/authRoutes';
import { clienteRoutes } from './routes/clienteRoutes';
import { processoRoutes } from './routes/processoRoutes';
import { financeiroRoutes } from './routes/financeiroRoutes';
import { authMiddleware } from './middlewares/authMiddleware';
import { errorMiddleware } from './middlewares/errorMiddleware';

const app: Application = express();

// Middlewares globais
app.use(cors());
app.use(express.json());

// Rotas públicas
app.use('/auth', authRoutes);

app.get('/health', (req: Request, res: Response) => {
  res.json({ 
    status: "Service Online", 
    timestamp: new Date().toISOString() 
  });
});

// Middleware de autenticação
app.use(authMiddleware);

// Rotas protegidas
app.use('/clientes', clienteRoutes);
app.use('/processos', processoRoutes);
app.use('/financeiro', financeiroRoutes);

// Tratamento de erros
app.use(errorMiddleware);

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`\n==============================================`);
  console.log(`🚀 API Server initialized successfully`);
  console.log(`📍 Endpoint: http://localhost:${PORT}`);
  console.log(`==============================================`);
  console.log(`🟢 Public:     /auth, /health`);
  console.log(`🔴 Protected:  /clientes, /processos, /financeiro`);
  console.log(`==============================================\n`);
});