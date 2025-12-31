import { AuthRequest, AuthenticatedUserPayload } from '../middleware/auth';
import { UserRole } from '../models/users.model';
import { ForbiddenError, UnauthorizedError } from '../utils/errors';

type RequestUser = NonNullable<AuthRequest['user']>;

/**
 * 验证用户角色权限
 * 如果用户未登录或角色不匹配，会抛出相应的错误
 * @param user 当前用户信息（可能为undefined）
 * @param roles 允许的角色列表
 * @returns 返回类型安全的用户对象
 * @throws UnauthorizedError 如果用户未登录
 * @throws ForbiddenError 如果用户角色不在允许列表中
 */
export const requireRole = <R extends UserRole>(
  user: AuthRequest['user'],
  roles: ReadonlyArray<R>
): RequestUser & { role: R } => {
  if (!user) {
    throw new UnauthorizedError('Authentication required');
  }

  // 如果用户角色不在允许列表中，抛出403错误
  // 提供更详细的错误消息，说明需要哪些角色
  if (!roles.includes(user.role as R)) {
    const roleNames = roles.map(r => {
      switch (r) {
        case 'judge': return '法官';
        case 'prosecutor': return '检察官';
        case 'lawyer': return '律师';
        case 'police': return '公安机关';
        case 'admin': return '管理员';
        default: return r;
      }
    }).join('或');
    throw new ForbiddenError(`权限不足：此操作需要${roleNames}角色`);
  }

  return user as RequestUser & { role: R };
};

export const isRoleAllowed = <R extends UserRole>(
  role: UserRole | undefined,
  roles: ReadonlyArray<R>
): role is R => {
  return Boolean(role && roles.includes(role as R));
};


