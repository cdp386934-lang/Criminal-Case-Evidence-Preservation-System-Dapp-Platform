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
  Scale,
  Bell,
  FolderOpen,
  Gavel,
  ClipboardList,
  AlertCircle,
  Users,
  Shield,
  ClipboardCheck
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

  // 根据角色定义导航项
  const getNavItems = () => {
    const baseItems = [
      { href: '/dashboard', label: '首页', icon: Home }
    ]

    if (!user) return baseItems

    switch (user.role) {
      case 'police':
        return [
          ...baseItems,
          { href: '/notification/notification-list', label: '通知', icon: Bell },
          { href: '/case/case-list', label: '案件', icon: Briefcase },
          { href: '/evidence/evidence-list', label: '证据', icon: FolderOpen },
          { href: '/objection/objectionList', label: '诉讼', icon: FileText },
          { href: '/correction/correction-list', label: '补正', icon: Edit },
          { href: '/defense-material/defense-material-list', label: '辩护材料', icon: FileText },
          { href: '/profile', label: '个人中心', icon: User }
        ]
      case 'judge':
        return [
          ...baseItems,
          { href: '/notification/notification-list', label: '通知', icon: Bell },
          { href: '/case/case-list', label: '案件', icon: Briefcase },
          { href: '/evidence/evidence-list', label: '证据', icon: FolderOpen },
          { href: '/objection/objectionList', label: '质证', icon: ClipboardList },
          { href: '/correction/correction-list', label: '补正', icon: Edit },
          { href: '/defense-material/defense-material-list', label: '辩护材料', icon: FileText },
          { href: '/profile', label: '个人中心', icon: User }
        ]
      case 'lawyer':
        return [
          ...baseItems,
          { href: '/notification/notification-list', label: '通知', icon: Bell },
          { href: '/case/case-list', label: '案件', icon: Briefcase },
          { href: '/evidence/evidence-list', label: '证据', icon: FolderOpen },
          { href: '/objection/objectionList', label: '质证', icon: ClipboardList },
          { href: '/defense-material/defense-material-list', label: '辩护材料', icon: FileText },
          { href: '/profile', label: '个人中心', icon: User }
        ]
      case 'prosecutor':
        return [
          ...baseItems,
          { href: '/notification/notification-list', label: '通知', icon: Bell },
          { href: '/case/case-list', label: '案件', icon: Briefcase },
          { href: '/evidence/evidence-list', label: '证据', icon: FolderOpen },
          { href: '/objection/objectionList', label: '质证', icon: ClipboardList },
          { href: '/correction/correction-list', label: '补正', icon: Edit },
          { href: '/defense-material/defense-material-list', label: '辩护材料', icon: FileText },
          { href: '/profile', label: '个人中心', icon: User }
        ]
      case 'admin':
        return [
          ...baseItems,
          { href: '/notification/add-notification', label: '推送通知', icon: Bell },
          { href: '/users/user-list', label: '用户管理', icon: Users },
          { href: '/users/role-management', label: '权限管理', icon: Shield },
          { href: '/operation-logs/operation-logs-list', label: '日志管理', icon: ClipboardCheck },
          { href: '/profile', label: '个人中心', icon: User }
        ]
      default:
        return baseItems
    }
  }

  const navItems = getNavItems()

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
                  {navItems.map((item) => {
                    const Icon = item.icon
                    const isActive = item.href === '/dashboard'
                      ? pathname === '/dashboard'
                      : pathname?.startsWith(item.href)
                    
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-colors ${
                          isActive
                            ? 'border-primary-900 text-primary-900'
                            : 'border-transparent text-neutral-600 hover:text-primary-900 hover:border-primary-700'
                        }`}
                      >
                        <Icon className="h-4 w-4 mr-1" />
                        {item.label}
                      </Link>
                    )
                  })}
                </div>
              </div>

              {/* 右侧用户信息 */}
              <div className="hidden sm:ml-6 sm:flex sm:items-center space-x-4">
                <div className="text-sm text-neutral-700">
                  <span className="font-medium">{user?.name}</span>
                  <span className="text-neutral-600 ml-2">
                    {(() => {
                      switch (user?.role) {
                        case 'judge': return '(法官)';
                        case 'prosecutor': return '(检察官)';
                        case 'lawyer': return '(律师)';
                        case 'police': return '(公安机关)';
                        case 'admin': return '(管理员)';
                        default: return '';
                      }
                    })()}
                  </span>
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
                {navItems.map((item) => {
                  const Icon = item.icon
                  const isActive = item.href === '/dashboard'
                    ? pathname === '/dashboard'
                    : pathname?.startsWith(item.href)
                  
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`block pl-3 pr-4 py-2 border-l-4 text-base font-medium transition-colors ${
                        isActive
                          ? 'text-primary-900 bg-background-secondary border-primary-700'
                          : 'text-neutral-600 hover:text-primary-900 hover:bg-background-secondary hover:border-primary-700'
                      }`}
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <div className="flex items-center">
                        <Icon className="h-4 w-4 mr-2" />
                        {item.label}
                      </div>
                    </Link>
                  )
                })}
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

