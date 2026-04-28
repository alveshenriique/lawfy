import { Router } from 'express';
import PerfilController from '../controllers/perfilController';
import { validate } from '../middlewares/validateMiddleware';
import { atualizarNomeSchema, atualizarSenhaSchema } from '../schemas/perfilSchema';

const router = Router();

router.put('/nome', validate(atualizarNomeSchema), PerfilController.atualizarNome);
router.put('/senha', validate(atualizarSenhaSchema), PerfilController.atualizarSenha);

export { router as perfilRoutes };
