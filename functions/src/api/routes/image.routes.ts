import { Router } from 'express';
import { generateImage } from '../controllers/image.controller';
import { isAuthenticated } from '../../middleware/auth';

const router = Router();

router.post('/generate', isAuthenticated, generateImage);

export default router;