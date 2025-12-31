'use client'

import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/store/authStore'
import Link from 'next/link'
import NotificationBell from './notification-bell'


interface DashboardLayoutProps {
  children: React.ReactNode
}

const roleLabels = {
  judge: '法官',
  prosecutor: '检察官',
  lawyer: '律师',
  admin: '管理员',
  police:'公安机关'
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const router = useRouter()
  const { user, logout } = useAuthStore()

  const handleLogout = () => {
    logout()
    router.push('/login')
  }

  const navItems = {
    police:[
        { href: '/dashboard/prosecutor', label: '案件管理' },
        { href: '/dashboard/prosecutor/evidence', label: '证据上传' },
        { href: '/dashboard/prosecutor/cases', label: '我的案件' },
      ],
    prosecutor: [
      { href: '/dashboard/prosecutor', label: '案件管理' },
      { href: '/dashboard/prosecutor/evidence', label: '证据上传' },
      { href: '/dashboard/prosecutor/cases', label: '我的案件' },
    ],
    judge: [
      { href: '/dashboard/judge', label: '案件审核' },
      { href: '/dashboard/judge/evidence', label: '证据审核' },
      { href: '/dashboard/judge/objections', label: '质证处理' },
    ],
    lawyer: [
      { href: '/dashboard/lawyer', label: '我的案件' },
      { href: '/dashboard/lawyer/evidence', label: '证据查看' },
      { href: '/dashboard/lawyer/objections', label: '质证意见' },
    ],
    admin: [
      { href: '/dashboard/lawyer', label: '我的案件' },
      { href: '/dashboard/lawyer/evidence', label: '证据查看' },
      { href: '/dashboard/lawyer/objections', label: '质证意见' },
    ],

  }

  const currentNavItems = user ? navItems[user.role] : []

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <h1 className="text-xl font-bold text-gray-900">
                  刑事案件存证系统
                </h1>
              </div>
              <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                {currentNavItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
                  >
                    {item.label}
                  </Link>
                ))}
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <NotificationBell />
              <span className="text-sm text-gray-700">
                {user?.name} ({roleLabels[user?.role || 'prosecutor']})
              </span>
              <button
                onClick={handleLogout}
                className="text-sm text-gray-500 hover:text-gray-700"
              >
                退出
              </button>
            </div>
          </div>
        </div>
      </nav>
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {children}
      </main>
    </div>
  )
}

