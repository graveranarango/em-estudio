import { Router } from 'express';
import { analyzeCompetition } from '../controllers/competition.controller';
import { isAuthenticated } from '../../middleware/auth';

const router = Router();

router.post('/analyze', isAuthenticated, analyzeCompetition);

export default router;