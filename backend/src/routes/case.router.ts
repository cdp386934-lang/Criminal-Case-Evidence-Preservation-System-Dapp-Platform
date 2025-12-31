import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import {
  addCase,
  updateCase,
  deleteCase,
  getCase,
  listCases,
  moveCaseNextStage,
  getCaseTimeline,
} from '../controllers/case.controller';
import { requireRole } from '../types/rbac';

const router = Router();

router.post('/add',authenticate, addCase);
router.put('/update/:id', authenticate, updateCase);
router.delete('/delete/:id', authenticate, deleteCase);
router.get('/get/:id', authenticate, getCase);
router.get('/list', authenticate, listCases);
router.post('/move-next-stage/:id', authenticate, moveCaseNextStage);
router.get('/timeline/:id', authenticate, getCaseTimeline);

export default router;