import { Router } from 'express';
import AuthController from '../controllers/authController';
import { validate } from '../middlewares/validateMiddleware';
import { authSchema } from '../schemas/authSchema';

const router = Router();

// Validamos o e-mail e senha antes de tentar cadastrar ou logar
router.post('/cadastro', validate(authSchema), AuthController.cadastrar);
router.post('/login', validate(authSchema), AuthController.login);

export { router as authRoutes };