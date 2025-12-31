import { NextFunction, Response } from 'express';
import mongoose from 'mongoose';
import { AuthRequest } from '../middleware/auth';
import { UserRole } from '../models/users.model';
import OperationLog, {
    OperationType,
    OperationTargetType,
} from '../models/operation-logs.model';
import { requireRole } from '../types/rbac';
import { BadRequestError, NotFoundError } from '../utils/errors';
import { sendSuccess } from '../utils/response';

type ControllerHandler = (
    req: AuthRequest,
    res: Response,
    next: NextFunction
) => Promise<void>;

/**
 * =========================
 * 管理员：操作日志列表
 * =========================
 * 支持条件：
 * - userId
 * - operationType
 * - targetType
 * - targetId
 * - 时间区间
 */
export const listOperationLogs: ControllerHandler = async (req,res,next) => {
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
export const getOperationLog: ControllerHandler = async (req,res,next) => {
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
