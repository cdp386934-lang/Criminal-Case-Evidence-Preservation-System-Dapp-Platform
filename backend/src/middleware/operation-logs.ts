import { NextFunction, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
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
        req.requestId = uuidv4();
      }

      // 在 response 结束后记录日志
      res.on('finish', async () => {
        try {
          // 只记录成功请求
          if (res.statusCode >= 200 && res.statusCode < 300 && req.user) {
            const targetId = options.getTargetId(req);
            if (!targetId) return;

            await OperationLog.create({
              userId: req.user.userId,
              operationType: options.operationType,
              targetType: options.targetType,
              targetId,
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
