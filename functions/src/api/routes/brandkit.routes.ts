import { Router } from 'express';
import { getBrandKit, updateBrandKit } from '../controllers/brandkit.controller';
import { isAuthenticated } from '../../middleware/auth';

const router = Router();

router.get('/get', isAuthenticated, getBrandKit);
router.post('/update', isAuthenticated, updateBrandKit);

export default router;