import { ReactNode } from 'react';
import { useAuthStore } from '../../store/authStore';
import { UserRole } from '../models/user.model';

interface RoleGuardProps {
  allow: UserRole[];
  children: ReactNode;
  fallback?: ReactNode;
}

/**
 * 角色权限守卫组件
 * 根据用户角色控制内容的显示
 */
export default function RoleGuard({ allow, children, fallback = null }: RoleGuardProps) {
  const { user } = useAuthStore();

  if (!user) {
    return <>{fallback}</>;
  }

  if (allow.includes(user.role)) {
    return <>{children}</>;
  }

  return <>{fallback}</>;
}

