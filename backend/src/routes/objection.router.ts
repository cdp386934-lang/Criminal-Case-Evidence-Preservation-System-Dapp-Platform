import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import {
  submitObjection,
  listObjections,
  getObjection,
  handleObjection,
} from '../controllers/objection.controller';

const router = Router();

router.post('/', authenticate, submitObjection);
router.get('/', authenticate, listObjections);
router.get('/:id', authenticate, getObjection);
router.post('/:id/handle', authenticate, handleObjection);

export default router;
