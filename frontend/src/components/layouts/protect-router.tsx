'use client'

import { ReactNode, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '../../../store/authStore'
import { UserRole } from '../../models/user.model'

interface ProtectedRouteProps {
  children: ReactNode
  allowedRoles?: UserRole[]
}

/**
 * 受保护的路由组件
 * 检查用户是否已登录，未登录则跳转到登录页
 * 如果指定了 allowedRoles，还会检查用户角色权限
 */
export default function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const router = useRouter()
  const { isAuthenticated, user } = useAuthStore()

  useEffect(() => {
    if (!isAuthenticated || !user) {
      router.push('/login')
      return
    }

    // 如果有角色限制，检查用户角色
    if (allowedRoles && allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
      router.push('/dashboard')
    }
  }, [isAuthenticated, user, router, allowedRoles])

  if (!isAuthenticated || !user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">请先登录</h1>
          <p className="text-gray-600">正在跳转到登录页...</p>
        </div>
      </div>
    )
  }

  // 如果有角色限制，检查权限
  if (allowedRoles && allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">权限不足</h1>
          <p className="text-gray-600">您没有访问此页面的权限</p>
        </div>
      </div>
    )
  }

  return <>{children}</>
}

