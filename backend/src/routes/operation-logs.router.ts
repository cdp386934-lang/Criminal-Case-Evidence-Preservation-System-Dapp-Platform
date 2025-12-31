import express from 'express';
import { authenticate } from '../middleware/auth';
import { listOperationLogs,getOperationLog} from '../controllers/operation-logs.controller';


const router = express.Router();

/**
 * 管理员操作日志
 */
router.get('/admin/list', authenticate, listOperationLogs);
router.get('/admin/:id', authenticate, getOperationLog);

export default router;
