import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import {
  addCorrection,
  deleteCorrection,
  getCorrection,
  listCorrections,
  updateCorrection,
} from '../controllers/correction.controller';

const router = Router();

router.post('/add', authenticate, addCorrection);
router.put('/update/:id', authenticate, updateCorrection);
router.delete('/delete/:id', authenticate, deleteCorrection);
router.get('/get/:id', authenticate, getCorrection);
router.get('/list/:evidenceId', authenticate, listCorrections);

export default router;


