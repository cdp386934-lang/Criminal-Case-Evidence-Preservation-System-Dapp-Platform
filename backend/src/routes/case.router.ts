import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import {
  createCase,
  updateCase,
  deleteCase,
  getCase,
  listCases,
  moveCaseNextStage,
  getCaseTimeline,
} from '../controllers/case.controller';

const router = Router();

/**
 * Case CRUD
 */
router.post('/', authenticate, createCase);            // 创建案件
router.get('/', authenticate, listCases);           // 查询当前用户案件列表
router.get('/:id', authenticate, getCase);          // 查询单个案件
router.put('/:id', authenticate, updateCase);       // 更新案件
router.delete('/:id', authenticate, deleteCase);    // 删除案件

/**
 * Case workflow
 */
router.post('/:id/status', authenticate, moveCaseNextStage); // 推进案件状态
router.get('/:id/timeline', authenticate, getCaseTimeline);  // 案件时间线

export default router;
