import { Router } from 'express';
import FinanceiroController from '../controllers/financeiroController';
import { validate } from '../middlewares/validateMiddleware';
import { financeiroSchema } from '../schemas/financeiroSchema';

const router = Router();

// Protegemos a criação de novos contratos financeiros
router.post('/', validate(financeiroSchema), FinanceiroController.gerarContrato);

router.get('/', FinanceiroController.listar);
router.put('/parcelas/:id', FinanceiroController.quitarParcela);
router.delete('/:id', FinanceiroController.remover);

export { router as financeiroRoutes };