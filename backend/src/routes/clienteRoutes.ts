import { Router } from 'express';
import ClienteController from '../controllers/clienteController';
import { validate } from '../middlewares/validateMiddleware';
import { clienteSchema } from '../schemas/clienteSchema';

const router = Router();

// A ordem importa: primeiro o validate, depois o cadastrar
router.post('/', validate(clienteSchema), ClienteController.cadastrar);

router.get('/', ClienteController.listar);
router.put('/:id', validate(clienteSchema), ClienteController.editar);
router.delete('/:id', ClienteController.remover);

export { router as clienteRoutes };