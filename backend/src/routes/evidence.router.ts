import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import {
  addEvidence,
  deleteEvidence,
  getEvidence,
  listEvidenceByCase,
  updateEvidence,
} from '../controllers/evidence.controller';

const router = Router();

router.post('/add', authenticate, addEvidence);
router.put('/update/:id', authenticate, updateEvidence);
router.delete('/delete/:id', authenticate, deleteEvidence);
router.get('/get/:id', authenticate, getEvidence);
router.get('/list/:caseId', authenticate, listEvidenceByCase);

export default router;


