import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import {
  addMaterial,
  updateMaterial,
  deleteMaterial,
  getMaterial,
  listMaterialsByCase,
} from '../controllers/defense-material.controller';

const router = Router();

router.post('/add', authenticate, addMaterial);
router.put('/update/:id', authenticate, updateMaterial);
router.delete('/delete/:id', authenticate, deleteMaterial);
router.get('/get/:id', authenticate, getMaterial);
router.get('/list/:caseId', authenticate, listMaterialsByCase);

export default router;

