import { Router } from 'express';
import FinanceiroController from '../controllers/financeiroController';
import { validate } from '../middlewares/validateMiddleware';
import { financeiroSchema } from '../schemas/financeiroSchema';

const router = Router();

router.post('/', validate(financeiroSchema), FinanceiroController.gerarContrato);
router.get('/', FinanceiroController.listar);
router.put('/:id', FinanceiroController.editar);
router.patch('/parcelas/:id/status', FinanceiroController.quitarParcela);
router.patch('/parcelas/:id/editar', FinanceiroController.editarParcela);
router.delete('/:id', FinanceiroController.remover);

export { router as financeiroRoutes };