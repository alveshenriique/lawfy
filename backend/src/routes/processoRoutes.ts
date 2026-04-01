import { Router } from 'express';
import ProcessoController from '../controllers/processoController';
import { validate } from '../middlewares/validateMiddleware';
import { processoSchema } from '../schemas/processoSchema';

const router = Router();

// Protegemos o cadastro e a edição com o Schema
router.post('/', validate(processoSchema), ProcessoController.cadastrar);
router.put('/:id', validate(processoSchema), ProcessoController.editar);

// Listagem e remoção não precisam de validação de corpo (body)
router.get('/', ProcessoController.listar);
router.delete('/:id', ProcessoController.remover);

export { router as processoRoutes };