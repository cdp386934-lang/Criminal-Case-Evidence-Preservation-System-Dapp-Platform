'use client'

import { ReactNode } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useAuthStore } from '../../../store/authStore'
import { useAuth } from '../../pages/useAuth'
import { 
  Home, 
  Briefcase, 
  FileText, 
  Edit, 
  User, 
  LogOut, 
  Menu,
  X,
  Scale
} from 'lucide-react'
import { useState } from 'react'
import ProtectedRoute from './protect-router'


interface MainLayoutProps {
  children: ReactNode
}

export default function MainLayout({ children }: MainLayoutProps) {
  const pathname = usePathname()
  const router = useRouter()
  const { user, isAuthenticated } = useAuthStore()
  const { logout } = useAuth()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  // 公共路由（不需要登录）
  const publicRoutes = ['/login', '/register']
  const isPublicRoute = publicRoutes.includes(pathname || '')

  // 如果是在公共路由，直接渲染子组件
  if (isPublicRoute) {
    return <>{children}</>
  }

  // 受保护的路由需要检查登录状态
  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-background-secondary">
        {/* 导航栏 */}
        <nav className="bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16">
              <div className="flex">
                <div className="flex-shrink-0 flex items-center">
                  <Link href="/dashboard" className="flex items-center space-x-2">
                    <Scale className="h-6 w-6 text-primary-900" />
                    <span className="text-xl font-semibold text-primary-900">刑事案件存证系统</span>
                  </Link>
                </div>
                {/* 桌面导航 */}
                <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                  <Link
                    href="/dashboard"
                    className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-colors ${
                      pathname === '/dashboard'
                        ? 'border-primary-900 text-primary-900'
                        : 'border-transparent text-neutral-600 hover:text-primary-900 hover:border-primary-700'
                    }`}
                  >
                    <Home className="h-4 w-4 mr-1" />
                    首页
                  </Link>
                  
                  <Link
                    href="/cases"
                    className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-colors ${
                      pathname?.startsWith('/cases')
                        ? 'border-primary-900 text-primary-900'
                        : 'border-transparent text-neutral-600 hover:text-primary-900 hover:border-primary-700'
                    }`}
                  >
                    <Briefcase className="h-4 w-4 mr-1" />
                    案件
                  </Link>

                  {user?.role === 'judge' && (
                    <Link
                      href="/cases/create"
                      className="inline-flex items-center px-1 pt-1 border-b-2 border-transparent text-sm font-medium text-neutral-600 hover:text-primary-900 hover:border-primary-700 transition-colors"
                    >
                      <Edit className="h-4 w-4 mr-1" />
                      新建案件
                    </Link>
                  )}
                </div>
              </div>

              {/* 右侧用户信息 */}
              <div className="hidden sm:ml-6 sm:flex sm:items-center space-x-4">
                <div className="text-sm text-neutral-700">
                  <span className="font-medium">{user?.name}</span>
                  <span className="text-neutral-600 ml-2">({user?.role === 'judge' ? '法官' : user?.role === 'prosecutor' ? '检察官' : '律师'})</span>
                </div>
                <Link
                  href="/profile"
                  className="text-neutral-600 hover:text-primary-900 transition-colors"
                >
                  <User className="h-5 w-5" />
                </Link>
                <button
                  onClick={logout}
                  className="text-neutral-600 hover:text-primary-900 transition-colors"
                >
                  <LogOut className="h-5 w-5" />
                </button>
              </div>

              {/* 移动端菜单按钮 */}
              <div className="sm:hidden flex items-center">
                <button
                  onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                  className="text-neutral-600 hover:text-primary-900 transition-colors"
                >
                  {mobileMenuOpen ? (
                    <X className="h-6 w-6" />
                  ) : (
                    <Menu className="h-6 w-6" />
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* 移动端菜单 */}
          {mobileMenuOpen && (
            <div className="sm:hidden border-t border-gray-200">
              <div className="pt-2 pb-3 space-y-1">
                <Link
                  href="/dashboard"
                  className="block pl-3 pr-4 py-2 border-l-4 text-base font-medium text-neutral-600 hover:text-primary-900 hover:bg-background-secondary hover:border-primary-700 transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  首页
                </Link>
                <Link
                  href="/cases"
                  className="block pl-3 pr-4 py-2 border-l-4 text-base font-medium text-neutral-600 hover:text-primary-900 hover:bg-background-secondary hover:border-primary-700 transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  案件
                </Link>
                {user?.role === 'judge' && (
                  <Link
                    href="/cases/create"
                    className="block pl-3 pr-4 py-2 border-l-4 text-base font-medium text-neutral-600 hover:text-primary-900 hover:bg-background-secondary hover:border-primary-700 transition-colors"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    新建案件
                  </Link>
                )}
                <Link
                  href="/profile"
                  className="block pl-3 pr-4 py-2 border-l-4 text-base font-medium text-neutral-600 hover:text-primary-900 hover:bg-background-secondary hover:border-primary-700 transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  个人资料
                </Link>
                <button
                  onClick={() => {
                    logout()
                    setMobileMenuOpen(false)
                  }}
                  className="block w-full text-left pl-3 pr-4 py-2 border-l-4 text-base font-medium text-neutral-600 hover:text-primary-900 hover:bg-background-secondary hover:border-primary-700 transition-colors"
                >
                  退出登录
                </button>
              </div>
            </div>
          )}
        </nav>

        {/* 主内容区 */}
        <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          {children}
        </main>
      </div>
    </ProtectedRoute>
  )
}

