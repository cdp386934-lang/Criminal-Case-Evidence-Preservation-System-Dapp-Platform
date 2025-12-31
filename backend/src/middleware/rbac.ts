import { NextFunction, Response } from 'express';
import { AuthRequest } from './auth';
import { UserRole } from '../models/users.model';
import { requireRole as requireRoleHelper } from '../types/rbac';
import { sendError } from '../utils/response';

export const requireRole =
  (roles: UserRole[]) =>
  (req: AuthRequest, res: Response, next: NextFunction): void => {
    try {
      requireRoleHelper(req.user, roles);
      next();
    } catch (error: any) {
      const message = error?.message || 'Insufficient permissions for this action';
      const status = error?.statusCode ?? 403;
      sendError(res, status, message);
    }
  };

export const requireJudge = requireRole([UserRole.JUDGE]);
export const requireProsecutor = requireRole([UserRole.PROSECUTOR]);
export const requireLawyer = requireRole([UserRole.LAWYER]);
export const requirePolice = requireRole([UserRole.POLICE]);
export const requireAdmin = requireRole([UserRole.ADMIN]);


