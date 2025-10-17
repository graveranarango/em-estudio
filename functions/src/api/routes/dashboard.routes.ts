import { Router } from 'express';
import { getDashboardData } from '../controllers/dashboard.controller';
import { isAuthenticated } from '../../middleware/auth';

const router = Router();

router.get('/data', isAuthenticated, getDashboardData);

export default router;