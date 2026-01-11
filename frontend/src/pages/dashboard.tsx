'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/store/authStore'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { Briefcase, Plus, FileText, Users, Gavel, Scale, Shield, Bell, Lock, User } from 'lucide-react'
import MainLayout from '@/components/layouts/main-layout'
import { Case } from '@/models/case.model'
import apiClient from '@/api/api-client'
import { CaseApi } from '@/api/case.api'
import RoleGuard from '@/components/role-guard'

export default function DashboardPage() {
  const router = useRouter()
  const { user, isAuthenticated } = useAuthStore()
  const [cases, setCases] = useState<Case[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!isAuthenticated || !user) {
      router.push('/login')
      return
    }
    loadCases()
  }, [user, isAuthenticated, router])

  const loadCases = async () => {
    try {
      setLoading(true)
      const response = await CaseApi.list()
      setCases(Array.isArray(response.data) ? response.data : response.data?.data || [])
    } catch (error) {
      console.error('Failed to load cases:', error)
    } finally {
      setLoading(false)
    }
  }

  if (!isAuthenticated || !user) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background-secondary">
        <div className="text-center">
          <div className="animate-spin rounded h-12 w-12 border-2 border-primary-900 border-t-transparent mx-auto"></div>
          <p className="mt-4 text-neutral-600">正在验证身份...</p>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center min-h-[calc(100vh-100px)]">
          <div className="text-center">
            <div className="animate-spin rounded h-12 w-12 border-2 border-primary-900 border-t-transparent mx-auto"></div>
            <p className="mt-4 text-neutral-600">加载中...</p>
          </div>
        </div>
      </MainLayout>
    )
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* 角色特定的欢迎信息 + 头像 */}
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-4">
            {/* 头像 */}
            <div className="w-14 h-14 rounded overflow-hidden border border-gray-300 bg-background-secondary flex items-center justify-center">
              {user.avatar ? (
                <img
                  src={`${apiClient}${user.avatar}`}
                  alt={user.name}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    ; (e.target as HTMLImageElement).style.display = 'none'
                  }}
                />
              ) : (
                <span className="text-lg font-semibold text-neutral-600">
                  {user.name?.charAt(0).toUpperCase() || 'U'}
                </span>
              )}
            </div>
            <div className="flex items-center gap-3">
              {/* 角色图标 */}
              {user?.role === 'judge' && <Gavel className="h-8 w-8 text-primary-900" />}
              {user?.role === 'prosecutor' && <Shield className="h-8 w-8 text-primary-900" />}
              {user?.role === 'lawyer' && <Scale className="h-8 w-8 text-primary-900" />}
              {user?.role === 'police' && <Shield className="h-8 w-8 text-primary-900" />}
              {user?.role === 'admin' && <Users className="h-8 w-8 text-primary-900" />}

              {/* 标题与欢迎语 */}
              <div>
                <h1 className="text-2xl font-semibold text-primary-900">
                  {user?.role === 'judge' && '法官工作台'}
                  {user?.role === 'prosecutor' && '检察官工作台'}
                  {user?.role === 'lawyer' && '律师工作台'}
                  {user?.role === 'police' && '公安办案工作台'}
                  {user?.role === 'admin' && '管理员工作台'}
                </h1>
                <p className="mt-2 text-neutral-600">
                  欢迎回来，{user?.name}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* 角色特定的快捷操作 */}
        {user?.role === 'admin' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <Link href="/cases">
              <Card className="h-full hover:border-primary-700 transition-colors cursor-pointer border border-gray-200">
                <CardContent className="p-6 flex items-center gap-4 h-full">
                  <div className="p-3 bg-background-secondary rounded border border-gray-300 flex-shrink-0">
                    <Briefcase className="h-6 w-6 text-primary-900" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-primary-900">案件管理</h3>
                    <p className="text-sm text-neutral-600 mt-1">查看和管理所有案件</p>
                  </div>
                </CardContent>
              </Card>
            </Link>
            <Link href="/notifications/create">
              <Card className="h-full hover:border-primary-700 transition-colors cursor-pointer border border-gray-200">
                <CardContent className="p-6 flex items-center gap-4 h-full">
                  <div className="p-3 bg-background-secondary rounded border border-gray-300 flex-shrink-0">
                    <Bell className="h-6 w-6 text-primary-900" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-primary-900">推送通知</h3>
                    <p className="text-sm text-neutral-600 mt-1">创建系统通知</p>
                  </div>
                </CardContent>
              </Card>
            </Link>
            <Link href="/profile">
              <Card className="h-full hover:border-primary-700 transition-colors cursor-pointer">
                <CardContent className="p-6 flex items-center gap-4 h-full">
                  <div className="p-3 bg-background-secondary rounded flex-shrink-0 border border-gray-300">
                    <User className="h-6 w-6 text-primary-900" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-primary-900">个人中心</h3>
                    <p className="text-sm text-neutral-600 mt-1">查看和编辑个人资料</p>
                  </div>
                </CardContent>
              </Card>
            </Link>
          </div>
        )}
        {user?.role === 'police' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <Link href="/police/notifications">
              <Card className="h-full hover:border-primary-700 transition-colors cursor-pointer border border-gray-200">
                <CardContent className="p-6 flex items-center gap-4 h-full">
                  <div className="p-3 bg-background-secondary rounded border border-gray-300 flex-shrink-0">
                    <Bell className="h-6 w-6 text-primary-900" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-primary-900">推送通知</h3>
                    <p className="text-sm text-neutral-600 mt-1">查看最新的系统通知</p>
                  </div>
                </CardContent>
              </Card>
            </Link>
            <Link href="/cases">
              <Card className="h-full hover:border-primary-700 transition-colors cursor-pointer border border-gray-200">
                <CardContent className="p-6 flex items-center gap-4 h-full">
                  <div className="p-3 bg-background-secondary rounded border border-gray-300 flex-shrink-0">
                    <Briefcase className="h-6 w-6 text-primary-900" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-primary-900">案件管理</h3>
                    <p className="text-sm text-neutral-600 mt-1">查看和管理所有案件</p>
                  </div>
                </CardContent>
              </Card>
            </Link>
            <Link href="/cases/create">
              <Card className="h-full hover:border-primary-700 transition-colors cursor-pointer border border-gray-200">
                <CardContent className="p-6 flex items-center gap-4 h-full">
                  <div className="p-3 bg-background-secondary rounded border border-gray-300 flex-shrink-0">
                    <FileText className="h-6 w-6 text-primary-900" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-primary-900">创建案件</h3>
                    <p className="text-sm text-neutral-600 mt-1">创建新的案件</p>
                  </div>
                </CardContent>
              </Card>
            </Link>
            <Link href="/profile">
              <Card className="h-full hover:border-primary-700 transition-colors cursor-pointer border border-gray-200">
                <CardContent className="p-6 flex items-center gap-4 h-full">
                  <div className="p-3 bg-background-secondary rounded border border-gray-300 flex-shrink-0">
                    <Users className="h-6 w-6 text-primary-900" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-primary-900">个人中心</h3>
                    <p className="text-sm text-neutral-600 mt-1">查看和编辑个人资料</p>
                  </div>
                </CardContent>
              </Card>
            </Link>
          </div>
        )}
        {user?.role === 'judge' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <Link href="/judge/notifications">
              <Card className="h-full hover:border-primary-700 transition-colors cursor-pointer border border-gray-200">
                <CardContent className="p-6 flex items-center gap-4 h-full">
                  <div className="p-3 bg-background-secondary rounded border border-gray-300 flex-shrink-0">
                    <Bell className="h-6 w-6 text-primary-900" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-primary-900">推送通知</h3>
                    <p className="text-sm text-neutral-600 mt-1">查看最新的系统通知</p>
                  </div>
                </CardContent>
              </Card>
            </Link>
            <Link href="/cases">
              <Card className="h-full hover:border-primary-700 transition-colors cursor-pointer border border-gray-200">
                <CardContent className="p-6 flex items-center gap-4 h-full">
                  <div className="p-3 bg-background-secondary rounded border border-gray-300 flex-shrink-0">
                    <Briefcase className="h-6 w-6 text-primary-900" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-primary-900">案件管理</h3>
                    <p className="text-sm text-neutral-600 mt-1">查看和管理所有案件</p>
                  </div>
                </CardContent>
              </Card>
            </Link>
            <Link href="/objections">
              <Card className="h-full hover:border-primary-700 transition-colors cursor-pointer border border-gray-200">
                <CardContent className="p-6 flex items-center gap-4 h-full">
                  <div className="p-3 bg-background-secondary rounded border border-gray-300 flex-shrink-0">
                    <FileText className="h-6 w-6 text-primary-900" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-primary-900">质证意见</h3>
                    <p className="text-sm text-neutral-600 mt-1">处理质证意见</p>
                  </div>
                </CardContent>
              </Card>
            </Link>
            <Link href="/profile">
              <Card className="h-full hover:border-primary-700 transition-colors cursor-pointer border border-gray-200">
                <CardContent className="p-6 flex items-center gap-4 h-full">
                  <div className="p-3 bg-background-secondary rounded border border-gray-300 flex-shrink-0">
                    <User className="h-6 w-6 text-primary-900" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-primary-900">个人中心</h3>
                    <p className="text-sm text-neutral-600 mt-1">查看和编辑个人资料</p>
                  </div>
                </CardContent>
              </Card>
            </Link>
          </div>
        )}
        {user?.role === 'lawyer' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <Link href="/lawyer/notifications">
              <Card className="h-full hover:border-primary-700 transition-colors cursor-pointer border border-gray-200">
                <CardContent className="p-6 flex items-center gap-4 h-full">
                  <div className="p-3 bg-background-secondary rounded border border-gray-300 flex-shrink-0">
                    <Bell className="h-6 w-6 text-primary-900" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-primary-900">推送通知</h3>
                    <p className="text-sm text-neutral-600 mt-1">查看最新的系统通知</p>
                  </div>
                </CardContent>
              </Card>
            </Link>
            <Link href="/cases">
              <Card className="h-full hover:border-primary-700 transition-colors cursor-pointer border border-gray-200">
                <CardContent className="p-6 flex items-center gap-4 h-full">
                  <div className="p-3 bg-background-secondary rounded border border-gray-300 flex-shrink-0">
                    <Briefcase className="h-6 w-6 text-primary-900" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-primary-900">案件管理</h3>
                    <p className="text-sm text-neutral-600 mt-1">查看和管理所有案件</p>
                  </div>
                </CardContent>
              </Card>
            </Link>
            <Link href="/objections">
              <Card className="h-full hover:border-primary-700 transition-colors cursor-pointer border border-gray-200">
                <CardContent className="p-6 flex items-center gap-4 h-full">
                  <div className="p-3 bg-orange-100 rounded-lg flex-shrink-0">
                    <FileText className="h-6 w-6 text-orange-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-primary-900">质证意见</h3>
                    <p className="text-sm text-neutral-600 mt-1">提交和管理质证意见</p>
                  </div>
                </CardContent>
              </Card>
            </Link>
            <Link href="/profile">
              <Card className="h-full hover:border-primary-700 transition-colors cursor-pointer border border-gray-200">
                <CardContent className="p-6 flex items-center gap-4 h-full">
                  <div className="p-3 bg-background-secondary rounded border border-gray-300 flex-shrink-0">
                    <User className="h-6 w-6 text-primary-900" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-primary-900">个人中心</h3>
                    <p className="text-sm text-neutral-600 mt-1">查看和编辑个人资料</p>
                  </div>
                </CardContent>
              </Card>
            </Link>
          </div>
        )}
        {user?.role === 'prosecutor' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <Link href="/prosecutor/notifications">
              <Card className="h-full hover:border-primary-700 transition-colors cursor-pointer border border-gray-200">
                <CardContent className="p-6 flex items-center gap-4 h-full">
                  <div className="p-3 bg-background-secondary rounded border border-gray-300 flex-shrink-0">
                    <Bell className="h-6 w-6 text-primary-900" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-primary-900">推送通知</h3>
                    <p className="text-sm text-neutral-600 mt-1">查看最新的系统通知</p>
                  </div>
                </CardContent>
              </Card>
            </Link>
            <Link href="/cases">
              <Card className="h-full hover:border-primary-700 transition-colors cursor-pointer border border-gray-200">
                <CardContent className="p-6 flex items-center gap-4 h-full">
                  <div className="p-3 bg-background-secondary rounded border border-gray-300 flex-shrink-0">
                    <Briefcase className="h-6 w-6 text-primary-900" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-primary-900">案件管理</h3>
                    <p className="text-sm text-neutral-600 mt-1">查看和管理所有案件</p>
                  </div>
                </CardContent>
              </Card>
            </Link>
            <Link href="/objections">
              <Card className="h-full hover:border-primary-700 transition-colors cursor-pointer border border-gray-200">
                <CardContent className="p-6 flex items-center gap-4 h-full">
                  <div className="p-3 bg-rose-100 rounded-lg flex-shrink-0">
                    <FileText className="h-6 w-6 text-rose-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-primary-900">质证意见</h3>
                    <p className="text-sm text-neutral-600 mt-1">查看质证意见</p>
                  </div>
                </CardContent>
              </Card>
            </Link>
            <Link href="/profile">
              <Card className="h-full hover:border-primary-700 transition-colors cursor-pointer border border-gray-200">
                <CardContent className="p-6 flex items-center gap-4 h-full">
                  <div className="p-3 bg-background-secondary rounded border border-gray-300 flex-shrink-0">
                    <User className="h-6 w-6 text-primary-900" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-primary-900">个人中心</h3>
                    <p className="text-sm text-neutral-600 mt-1">查看和编辑个人资料</p>
                  </div>
                </CardContent>
              </Card>
            </Link>
          </div>
        )}

        {/* 统计卡片 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">案件总数</CardTitle>
              <Briefcase className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{cases.length}</div>
              <p className="text-xs text-muted-foreground">您参与的案件</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">进行中</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {
                  Array.isArray(cases) ? cases.filter(c => c?.status === 'INVESTIGATION').length : 0
                }
              </div>
              <p className="text-xs text-muted-foreground">进行中的案件</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">已完成</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {cases.filter(c => c.status === 'CLOSED').length}
              </div>
              <p className="text-xs text-muted-foreground">已完成的案件</p>
            </CardContent>
          </Card>
        </div>

        {/* 最近案件 */}
        <Card>
          <CardHeader>
            <CardTitle>最近案件</CardTitle>
            <CardDescription>您最近参与的案件列表</CardDescription>
          </CardHeader>
          <CardContent>
            {cases.length === 0 ? (
              <div className="text-center py-8 text-neutral-600">
                暂无案件
                <RoleGuard allow={['judge', 'police', 'prosecutor']}>
                  <Link href="/cases/create">
                    <Button className="mt-4" variant="outline">
                      <Plus className="h-4 w-4 mr-2" />
                      创建第一个案件
                    </Button>
                  </Link>
                </RoleGuard>
              </div>
            ) : (
              <div className="space-y-4">
                {cases.slice(0, 5).map((caseItem) => (
                  <Link
                    key={caseItem._id}
                    href={`/cases/${caseItem._id}`}
                    className="block p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-semibold text-gray-900">{caseItem.caseTitle}</h3>
                        <p className="text-sm text-gray-600 mt-1">案件编号: {caseItem.caseNumber}</p>
                        <p className="text-sm text-neutral-600 mt-1">类型: {caseItem.caseType}</p>
                      </div>
                      <span
                        className={`px-2 py-1 text-xs rounded-full ${caseItem.status === 'CLOSED'
                          ? 'bg-green-100 text-green-800'
                          : caseItem.status === 'INVESTIGATION'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-gray-100 text-primary-900'
                          }`}
                      >
                        {caseItem.status === 'CLOSED'
                          ? '已完成'
                          : caseItem.status === 'INVESTIGATION'
                            ? '进行中'
                            : '待处理'}
                      </span>
                    </div>
                  </Link>
                ))}
                {cases.length > 5 && (
                  <Link href="/cases">
                    <Button variant="outline" className="w-full">
                      查看全部案件
                    </Button>
                  </Link>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  )
}

