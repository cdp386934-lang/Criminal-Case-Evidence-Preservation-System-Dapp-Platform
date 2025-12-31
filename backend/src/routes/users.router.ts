import express from 'express';
import { authenticate, authorize, AuthRequest } from '../middleware/auth';
import User, { UserRole } from '../models/users.model';
import { listRoles, revokeRole, setJudge, setLawyer, setPolice, setProsecutor, updateRole } from '../controllers/users.controller';
import { sendSuccess, sendError } from '../utils/response';

const router = express.Router();

// 获取当前用户信息
router.get('/me', authenticate, async (req: AuthRequest, res) => {
  try {
    const user = await User.findById(req.user?.userId).select('-password');
    if (!user) {
      return sendError(res, 404, 'User not found');
    }
    sendSuccess(res, user);
  } catch (error: any) {
    sendError(res, 500, error.message);
  }
});

// 获取所有用户（管理员）
router.get('/', authenticate, authorize(UserRole.ADMIN), async (_req, res) => {
  try {
    const users = await User.find().select('-password');
    sendSuccess(res, users);
  } catch (error: any) {
    sendError(res, 500, error.message);
  }
});

// 获取用户详情
router.get('/:id', authenticate, async (req: AuthRequest, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) {
      return sendError(res, 404, 'User not found');
    }
    sendSuccess(res, user);
  } catch (error: any) {
    sendError(res, 500, error.message);
  }
});

// 更新用户信息
router.put('/:id', authenticate, async (req: AuthRequest, res) => {
  try {
    // 只能更新自己的信息，除非是管理员
    if (req.params.id !== req.user?.userId && req.user?.role !== UserRole.ADMIN) {
      return sendError(res, 403, 'Forbidden');
    }

    const { name, phone, address } = req.body;
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { name, phone, address },
      { new: true }
    ).select('-password');

    if (!user) {
      return sendError(res, 404, 'User not found');
    }

    sendSuccess(res, user);
  } catch (error: any) {
    sendError(res, 500, error.message);
  }
});

// 链上授权接口（作为管理员可调用）
router.post('/admin/set-judge', authenticate, authorize(UserRole.ADMIN), setJudge);
router.post('/admin/set-prosecutor', authenticate, authorize(UserRole.ADMIN), setProsecutor);
router.post('/admin/set-lawyer', authenticate, authorize(UserRole.ADMIN), setLawyer);
router.post('/admin/set-police', authenticate, authorize(UserRole.ADMIN), setPolice);

router.get('/admin/roles', authenticate, authorize(UserRole.ADMIN), listRoles);
router.put('/admin/roles/:id', authenticate, authorize(UserRole.ADMIN), updateRole);
router.delete('/admin/roles/:id', authenticate, authorize(UserRole.ADMIN), revokeRole);


export default router;

