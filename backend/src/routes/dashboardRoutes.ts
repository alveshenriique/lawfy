import { Router } from 'express';
import DashboardController from '../controllers/dashboardController';

const router = Router();

router.get('/', DashboardController.resumo);

export { router as dashboardRoutes };