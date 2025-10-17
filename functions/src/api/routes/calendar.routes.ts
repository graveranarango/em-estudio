import { Router } from 'express';
import { getCalendarEvents } from '../controllers/calendar.controller';
import { isAuthenticated } from '../../middleware/auth';

const router = Router();

router.get('/events', isAuthenticated, getCalendarEvents);

export default router;