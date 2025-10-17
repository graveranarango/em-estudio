import { Router } from 'express';
import { generatePodcast } from '../controllers/podcast.controller';
import { isAuthenticated } from '../../middleware/auth';

const router = Router();

router.post('/generate', isAuthenticated, generatePodcast);

export default router;