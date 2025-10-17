import { Router } from 'express';
import { recursiveDelete } from '../controllers/utils.controller';
import { isAuthenticated } from '../../middleware/auth';

const router = Router();

router.post('/recursive-delete', isAuthenticated, recursiveDelete);

export default router;