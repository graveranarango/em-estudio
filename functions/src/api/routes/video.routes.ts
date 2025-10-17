import { Router } from 'express';
import { generateVideo } from '../controllers/video.controller';
import { isAuthenticated } from '../../middleware/auth';

const router = Router();

router.post('/generate', isAuthenticated, generateVideo);

export default router;