import { NextFunction, Response } from 'express';
import mongoose from 'mongoose';
import { AuthRequest } from '../middleware/auth';
import { UserRole } from '../models/users.model';
import { requireRole } from '../types/rbac';
import { NotFoundError } from '../utils/errors';
import { sendSuccess } from '../utils/response';
import OperationLog, {
  OperationType,
  OperationTargetType,
} from '../models/operation-logs.model';

type ControllerHandler = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => Promise<void>;

/**
 * 管理员：操作日志列表
 * 日志功能：分页、查询(模糊搜索)（根据时间、用户id，操作类型）
 * 这里需要按照 operationType、targetType 设置动作标注
 * 通过在各业务 Controller 中调用统一的 recordOperation 函数进行记录
 */
export const listOperationLogs: ControllerHandler = async (req, res, next) => {
    try {
        requireRole(req.user, [UserRole.ADMIN]);
        const {
            page = '1',
            pageSize = '20',
            userId,
            operationType,
            targetType,
            targetId,
            from,
            to,
            requestId,
        } = req.query;

        const pageNum = Math.max(1, parseInt(page as string, 10));
        const pageSizeNum = Math.min(
            100,
            Math.max(1, parseInt(pageSize as string, 10))
        );

        const query: any = {};

        if (userId) {
            query.userId = new mongoose.Types.ObjectId(userId as string);
        }

        if (operationType) {
            query.operationType = operationType;
        }

        if (targetType) {
            query.targetType = targetType;
        }

        if (targetId) {
            query.targetId = new mongoose.Types.ObjectId(targetId as string);
        }

        if (requestId) {
            query.requestId = requestId;
        }

        if (from || to) {
            query.createdAt = {};
            if (from) query.createdAt.$gte = new Date(from as string);
            if (to) query.createdAt.$lte = new Date(to as string);
        }

        const total = await OperationLog.countDocuments(query);

        const logs = await OperationLog.find(query)
            .populate('userId', 'name email role')
            .sort({ createdAt: -1 })
            .skip((pageNum - 1) * pageSizeNum)
            .limit(pageSizeNum);

        sendSuccess(res, {
            items: logs,
            page: pageNum,
            pageSize: pageSizeNum,
            total,
        });
    } catch (error) {
        next(error);
    }
};

/**
 * =========================
 * 管理员：查看单条日志
 * =========================
 */
export const getOperationLog: ControllerHandler = async (req, res, next) => {
    try {
        requireRole(req.user, [UserRole.ADMIN]);

        const log = await OperationLog.findById(req.params.id)
            .populate('userId', 'name email role');

        if (!log) {
            throw new NotFoundError('Operation log not found');
        }

        sendSuccess(res, log);
    } catch (error) {
        next(error);
    }
};

/* =====================================================
   OperationLog 统一记录函数（供业务 Controller 调用）
===================================================== */

interface RecordOperationParams {
  req: AuthRequest;
  operationType: OperationType;
  targetType: OperationTargetType;
  targetId: string;
  description: string;
}

export const recordOperation = async ({
  req,
  operationType,
  targetType,
  targetId,
  description,
}: RecordOperationParams): Promise<void> => {
  if (!req.user) return;

  try {
    await OperationLog.create({
      userId: req.user.userId,
      operationType,
      targetType,
      targetId: new mongoose.Types.ObjectId(targetId),
      description,
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
      requestId: (req as any).requestId,
    });
  } catch (err) {
    // 日志失败不影响主流程
    console.error('Failed to record operation log:', err);
  }
};
