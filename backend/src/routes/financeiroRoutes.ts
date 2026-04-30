import { Router } from 'express';
import FinanceiroController from '../controllers/financeiroController';
import { validate } from '../middlewares/validateMiddleware';
import { financeiroSchema } from '../schemas/financeiroSchema';
import { editarParcelaSchema, quitarParcelaSchema } from '../schemas/parcelaSchema';

const router = Router();

router.post('/', validate(financeiroSchema), FinanceiroController.gerarContrato);
router.get('/', FinanceiroController.listar);
router.put('/:id', FinanceiroController.editar);
router.patch('/parcelas/:id/status', validate(quitarParcelaSchema), FinanceiroController.quitarParcela);
router.patch('/parcelas/:id/editar', validate(editarParcelaSchema), FinanceiroController.editarParcela);
router.delete('/:id', FinanceiroController.remover);

export { router as financeiroRoutes };