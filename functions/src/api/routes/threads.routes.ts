import { Router } from 'express';
import { isAuthenticated } from '../../middleware/auth';
import {
  listThreads,
  createThread,
  renameThread,
  deleteThread,
  createBranch,
  renameBranch,
  deleteBranch,
  switchBranch,
  branchFromMessage
} from '../controllers/threads.controller';

const router = Router();

// Thread routes
router.get('/listThreads', isAuthenticated, listThreads);
router.post('/createThread', isAuthenticated, createThread);
router.post('/renameThread', isAuthenticated, renameThread);
router.post('/deleteThread', isAuthenticated, deleteThread);

// Branch routes
router.post('/createBranch', isAuthenticated, createBranch);
router.post('/renameBranch', isAuthenticated, renameBranch);
router.post('/deleteBranch', isAuthenticated, deleteBranch);

// These are not fully implemented in the controller, but we'll add the routes
router.post('/switchBranch', isAuthenticated, switchBranch);
router.post('/branchFromMessage', isAuthenticated, branchFromMessage);

export default router;