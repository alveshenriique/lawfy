import { Router } from 'express';
import PerfilController from '../controllers/perfilController';

const router = Router();

router.put('/nome', PerfilController.atualizarNome);
router.put('/senha', PerfilController.atualizarSenha);

export { router as perfilRoutes };