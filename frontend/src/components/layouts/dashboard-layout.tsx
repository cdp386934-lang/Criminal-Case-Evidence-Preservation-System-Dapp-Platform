import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuthStore } from '../../../store/authStore'
import NotificationBell from './notification-bell'


interface DashboardLayoutProps {
  children: React.ReactNode
}

const roleLabels: Record<string, string> = {
  judge: '法官',
  prosecutor: '检察官',
  lawyer: '律师',
  admin: '管理员',
  police: '公安机关'
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const router = useRouter()
  const { user, logout } = useAuthStore()

  const handleLogout = () => {
    logout()
    router.push('/login')
  }

  const navItems: Record<string, Array<{ href: string; label: string }>> = {
    // police (公安机关): 通知(接收发送删除)、案件(增删改查)、证据(增删改查审批)、诉讼(上传撤销)、个人中心
    police: [
      { href: '/notification/notification-list', label: '通知中心' },
      { href: '/case/case-list', label: '案件管理' },
      { href: '/case/create-case', label: '创建案件' },
      { href: '/evidence/evidence-list', label: '证据管理' },
      { href: '/objection/objectionList', label: '诉讼管理' },
      { href: '/profile', label: '个人中心' },
    ],
    // prosecutor (检察官): 通知(接收发送删除)、案件(查)、证据(增删改查)、质证(增删改查)、个人中心
    prosecutor: [
      { href: '/notification/notification-list', label: '通知中心' },
      { href: '/case/case-list', label: '案件查看' },
      { href: '/evidence/evidence-list', label: '证据管理' },
      { href: '/objection/objectionList', label: '质证管理' },
      { href: '/profile', label: '个人中心' },
    ],
    // judge (法官): 通知(接收发送删除)、案件(删改查)、证据(删查审批)、质证(删查审批)、个人中心
    judge: [
      { href: '/notification/notification-list', label: '通知中心' },
      { href: '/case/case-list', label: '案件审核' },
      { href: '/evidence/evidence-list', label: '证据审核' },
      { href: '/objection/objectionList', label: '质证处理' },
      { href: '/profile', label: '个人中心' },
    ],
    // lawyer (律师): 通知(接收发送删除)、案件(查)、证据(增删改查)、质证(增删改查)、个人中心
    lawyer: [
      { href: '/notification/notification-list', label: '通知中心' },
      { href: '/case/case-list', label: '我的案件' },
      { href: '/evidence/evidence-list', label: '证据管理' },
      { href: '/objection/objectionList', label: '质证意见' },
      { href: '/profile', label: '个人中心' },
    ],
    // admin (管理员): 推送通知、用户管理、权限管理、日志管理、个人中心
    admin: [
      { href: '/notification/add-notification', label: '推送通知' },
      { href: '/users/user-list', label: '用户管理' },
      { href: '/users/role-management', label: '权限管理' },
      { href: '/operation-logs/operation-logs-list', label: '日志管理' },
      { href: '/profile', label: '个人中心' },
    ],
  }

  const currentNavItems = user ? navItems[user.role] : []

  return (
    <div className="min-h-screen bg-background-secondary">
      <nav className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <h1 className="text-xl font-semibold text-primary-900">
                  刑事案件存证系统
                </h1>
              </div>
              <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                {currentNavItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="border-transparent text-neutral-600 hover:text-primary-900 hover:border-primary-700 border-b-2 inline-flex items-center px-1 pt-1 text-sm font-medium transition-colors"
                  >
                    {item.label}
                  </Link>
                ))}
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <NotificationBell />
              <span className="text-sm text-neutral-700">
                {user?.name} ({roleLabels[user?.role || '']})
              </span>
              <button
                onClick={handleLogout}
                className="text-sm text-neutral-600 hover:text-primary-900 font-medium transition-colors"
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

