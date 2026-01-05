import { Request, Response, NextFunction } from 'express';
import { ParamsDictionary } from 'express-serve-static-core';
import { ParsedQs } from 'qs';
import User, { UserRole } from '../models/users.model';
import { verifyToken, extractTokenFromHeader } from '../utils/jwt';
import { sendError } from '../utils/response';
import { getTokenFromCookie } from '../utils/cookies';

export interface AuthenticatedUserPayload {
  userId: string;
  id: string;
  role: UserRole;
  email: string;
  walletAddress?: string;
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthenticatedUserPayload;
    }
  }
}

export interface AuthRequest<
  P = ParamsDictionary,
  ResBody = any,
  ReqBody = any,
  ReqQuery = ParsedQs,
  Locals extends Record<string, unknown> = Record<string, unknown>
> extends Request<P, ResBody, ReqBody, ReqQuery, Locals> {
  user?: AuthenticatedUserPayload;
  requestId?: string;
}

export const authenticate = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    // 优先从 Authorization Bearer，其次从 Cookie 获取，兼容多种前端用法
    const tokenFromHeader = extractTokenFromHeader(req.headers.authorization);
    const tokenFromCookie = getTokenFromCookie(req);
    const token = tokenFromHeader || tokenFromCookie;

    if (!token) {
      return sendError(res, 401, '未登录');
    }

    const payload = verifyToken(token);
    const user = await User.findById(payload.userId).select('-password');

    if (!user || !user.isActive) {
      return sendError(res, 401, '用户不存在或已被禁用');
    }

    req.user = {
      userId: user._id.toString(),
      id: user._id.toString(),
      role: user.role,
      email: user.email,
      walletAddress: user.walletAddress,
    };

    next();
  } catch (error) {
    return sendError(res, 401, 'Token无效或已过期');
  }
};

export const authorize = (...roles: UserRole[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return sendError(res, 401, 'Unauthorized');
    }

    if (!roles.includes(req.user.role)) {
      return sendError(res, 403, 'Forbidden: Insufficient permissions');
    }

    next();
  };
};

/**
 * 仅允许法官访问
 */
export const onlyJudge = (req: AuthRequest, res: Response, next: NextFunction) => {
  if (!req.user) {
    return res.status(401).json({ error: '未登录' });
  }

  if (req.user.role !== UserRole.JUDGE) {
    return res.status(403).json({ error: '权限不足：仅法官可访问' });
  }

  next();
};

/**
 * 仅允许检察官访问
 */
export const onlyProsecutor = (req: AuthRequest, res: Response, next: NextFunction) => {
  if (!req.user) {
    return res.status(401).json({ error: '未登录' });
  }

  if (req.user.role !== UserRole.PROSECUTOR) {
    return res.status(403).json({ error: '权限不足：仅检察官可访问' });
  }

  next();
};

/**
 * 仅允许律师访问
 */
export const onlyLawyer = (req: AuthRequest, res: Response, next: NextFunction) => {
  if (!req.user) {
    return res.status(401).json({ error: '未登录' });
  }

  if (req.user.role !== UserRole.LAWYER) {
    return res.status(403).json({ error: '权限不足：仅律师可访问' });
  }

  next();
};


/**
 * 仅允许公安机关访问
 */
export const onlyPolice = (req: AuthRequest, res: Response, next: NextFunction) => {
  if (!req.user) {
    return res.status(401).json({ error: '未登录' });
  }

  if (req.user.role !== UserRole.POLICE) {
    return res.status(403).json({ error: '权限不足：仅公安机关可访问' });
  }

  next();
};

/**
 * 仅允许管理员访问
 */
export const onlyAdmin = (req: AuthRequest, res: Response, next: NextFunction) => {
  if (!req.user) {
    return res.status(401).json({ error: '未登录' });
  }

  if (req.user.role !== UserRole.ADMIN) {
    return res.status(403).json({ error: '权限不足：仅管理员可访问' });
  }

  next();
};
