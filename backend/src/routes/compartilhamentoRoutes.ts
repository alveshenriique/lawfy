import { Router } from 'express';
import CompartilhamentoController from '../controllers/compartilhamentoController';

const router = Router({ mergeParams: true });

router.post('/', CompartilhamentoController.compartilharComTodos);
router.delete('/', CompartilhamentoController.removerTodos);

export { router as compartilhamentoRoutes };
