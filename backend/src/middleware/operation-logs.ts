import { NextFunction, Response } from 'express';
import mongoose from 'mongoose';
import OperationLog, {
  OperationType,
  OperationTargetType,
} from '../models/operation-logs.model';
import { AuthRequest } from './auth';

interface OperationLogOptions {
  operationType: OperationType;
  targetType: OperationTargetType;
  /**
   * 从 req 中解析 targetId
   * 如：req.params.id / req.body.caseId
   */
  getTargetId: (req: AuthRequest) => string | undefined;
  /**
   * 日志描述（支持动态）
   */
  description: string | ((req: AuthRequest) => string);
}

export const withOperationLog =
  (options: OperationLogOptions) =>
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      // 给每个请求生成 requestId（如不存在）
      if (!req.requestId) {
        // 使用时间戳 + 随机数简单生成一个 requestId，避免额外依赖
        req.requestId = `req_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
      }

      // 在 response 结束后记录日志
      res.on('finish', async () => {
        try {
          // 只记录成功请求，且要求有登录用户
          if (res.statusCode >= 200 && res.statusCode < 300 && req.user) {
            const targetIdStr = options.getTargetId(req);
            if (!targetIdStr) return;

            await OperationLog.create({
              userId: req.user.userId,
              operationType: options.operationType,
              targetType: options.targetType,
              // 与模型保持一致，存为 ObjectId
              targetId: new mongoose.Types.ObjectId(targetIdStr),
              description:
                typeof options.description === 'function'
                  ? options.description(req)
                  : options.description,
              ipAddress: req.ip,
              userAgent: req.headers['user-agent'],
              requestId: req.requestId,
            });
          }
        } catch (err) {
          // 日志失败不影响主流程
          console.error('OperationLog write failed:', err);
        }
      });

      next();
    } catch (error) {
      next(error);
    }
  };
