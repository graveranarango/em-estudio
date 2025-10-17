import { Router } from 'express';
import { getAuthUrl, handleAuthCallback } from '../controllers/google.controller';
import { isAuthenticated } from '../../middleware/auth';

const router = Router();

// This route generates the URL the user will visit to authorize the app
router.get('/auth/url', isAuthenticated, getAuthUrl);

// This is the callback route Google will redirect to after the user gives consent
router.get('/auth/callback', handleAuthCallback);

export default router;