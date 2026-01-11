'use client'

import { useEffect, useMemo, useState } from 'react'
import toast from 'react-hot-toast'
import { AuthApi } from '../api/auth.api'
import { User, Mail, Phone, MapPin, Wallet, Briefcase, Shield, Gavel, Scale, Users } from 'lucide-react'
import { User as UserType } from '@/models/user.model'
import { useAuthStore } from '../../store/authStore'
import ApiClient from '@/api/api-client'
import { Card, CardHeader, CardTitle, CardDescription, CardContent, MainLayout } from '@/components'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

// 获取 API 基础 URL（用于访问静态资源如图片）
const getApiBaseUrl = () => {
  const baseURL = ApiClient.defaults.baseURL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api'
  // 移除末尾的 /api，用于访问静态资源
  return baseURL.replace(/\/api\/?$/, '')
}

// 构建头像 URL
const getAvatarUrl = (avatarPath: string | null | undefined): string | null => {
  if (!avatarPath) return null
  // 如果已经是完整 URL，直接返回
  if (avatarPath.startsWith('http://') || avatarPath.startsWith('https://')) {
    return avatarPath
  }
  // 如果是相对路径，拼接 baseURL
  const baseUrl = getApiBaseUrl()
  return `${baseUrl}${avatarPath.startsWith('/') ? avatarPath : '/' + avatarPath}`
}

export default function ProfilePage() {
  const { user: authUser, setUser: setAuthUser } = useAuthStore()
  const [user, setUser] = useState<UserType | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({
    name: '',
    phone: '',
    address: '',
  })

  useEffect(() => {
    const loadProfile = async () => {
      try {
        setLoading(true)
        const res = await AuthApi.getMe()
        const data = res.data?.data || res.data
        setUser(data)
        setForm({
          name: data?.name || '',
          phone: data?.phone || '',
          address: data?.address || '',
        })
        // 同步到全局 auth store（保持头像/姓名等最新）
        setAuthUser({
          ...authUser,
          ...data,
        } as any)
      } catch (error: any) {
        console.error('加载用户信息失败', error)
        toast.error(error?.response?.data?.error || '加载用户信息失败')
      } finally {
        setLoading(false)
      }
    }
    loadProfile()
  }, [authUser, setAuthUser])

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return
    try {
      setSaving(true)
      const res = await ApiClient.put(`/users/${user._id || user.id}`, {
        name: form.name,
        phone: form.phone,
        address: form.address,
      })
      const updated = res.data?.data || res.data
      setUser(updated)
      setAuthUser({ ...(authUser as any), ...updated })
      toast.success('保存成功')
    } catch (error: any) {
      console.error('更新用户信息失败', error)
      toast.error(error?.response?.data?.error || '更新失败')
    } finally {
      setSaving(false)
    }
  }

  const roleIcon = useMemo(() => {
    if (!user?.role) return null
    if (user.role === 'judge') return <Gavel className="h-5 w-5 text-blue-600" />
    if (user.role === 'prosecutor') return <Shield className="h-5 w-5 text-red-600" />
    if (user.role === 'lawyer') return <Scale className="h-5 w-5 text-green-600" />
    if (user.role === 'police') return <Shield className="h-5 w-5 text-blue-600" />
    if (user.role === 'admin') return <Users className="h-5 w-5 text-gray-400" />
    return <Briefcase className="h-5 w-5 text-gray-400" />
  }, [user?.role])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-600">加载中...</p>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-600">未获取到用户信息</p>
      </div>
    )
  }

  const roleLabels = {
    judge: '法官',
    prosecutor: '检察官',
    lawyer: '律师',
    police: '警察',
    admin: '管理员',
  }

  return (
    <MainLayout>
      <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">个人资料</h1>
        <p className="mt-2 text-gray-600">查看和管理您的个人信息</p>
      </div>

      <Card>
        <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <div className="w-16 h-16 rounded overflow-hidden border border-gray-300 bg-background-secondary flex items-center justify-center">
            {getAvatarUrl(user.avatar) ? (
              <img
                src={getAvatarUrl(user.avatar)!}
                alt={user.name}
                className="w-full h-full object-cover"
                onError={(e) => {
                  // 如果图片加载失败，隐藏图片显示默认字符
                  const target = e.target as HTMLImageElement
                  target.style.display = 'none'
                  const parent = target.parentElement
                  if (parent && !parent.querySelector('span')) {
                    const fallback = document.createElement('span')
                    fallback.className = 'text-xl font-semibold text-neutral-600'
                    fallback.textContent = user.name?.charAt(0).toUpperCase() || 'U'
                    parent.appendChild(fallback)
                  }
                }}
              />
            ) : (
              <span className="text-xl font-semibold text-neutral-600">
                {user.name?.charAt(0).toUpperCase() || 'U'}
              </span>
            )}
          </div>
          <div>
            <CardTitle>基本信息</CardTitle>
            <CardDescription>您的账户基本信息</CardDescription>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-4">
            <User className="h-5 w-5 text-gray-400" />
            <div>
              <p className="text-sm text-gray-500">姓名</p>
              <p className="font-medium">{user.name}</p>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <Mail className="h-5 w-5 text-gray-400" />
            <div>
              <p className="text-sm text-gray-500">邮箱</p>
              <p className="font-medium">{user.email}</p>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            {roleIcon}
            <div>
              <p className="text-sm text-gray-500">角色</p>
              <p className="font-medium">{roleLabels[user.role]}</p>
            </div>
          </div>

          {user.walletAddress && (
            <div className="flex items-center space-x-4">
              <Wallet className="h-5 w-5 text-gray-400" />
              <div>
                <p className="text-sm text-gray-500">钱包地址</p>
                <p className="font-mono text-sm break-all">{user.walletAddress}</p>
              </div>
            </div>
          )}

          {user.createdAt && (
            <div className="flex items-center space-x-4">
              <Shield className="h-5 w-5 text-gray-400" />
              <div>
                <p className="text-sm text-gray-500">创建时间</p>
                <p className="font-medium">
                  {new Date(user.createdAt).toLocaleString('zh-CN')}
                </p>
              </div>
            </div>
          )}

          {user.phone && (
            <div className="flex items-center space-x-4">
              <Phone className="h-5 w-5 text-gray-400" />
              <div>
                <p className="text-sm text-gray-500">联系电话</p>
                <p className="font-medium">{user.phone}</p>
              </div>
            </div>
          )}

          {user.address && (
            <div className="flex items-center space-x-4">
              <MapPin className="h-5 w-5 text-gray-400" />
              <div>
                <p className="text-sm text-gray-500">联系地址</p>
                <p className="font-medium">{user.address}</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>编辑联系方式</CardTitle>
          <CardDescription>更新姓名、联系电话、联系地址</CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-4" onSubmit={handleSave}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <p className="text-sm text-gray-500">姓名</p>
                <Input
                  value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  placeholder="请输入姓名"
                />
              </div>
              <div className="space-y-2">
                <p className="text-sm text-gray-500">联系电话</p>
                <Input
                  value={form.phone}
                  onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
                  placeholder="请输入联系电话"
                />
              </div>
            </div>
            <div className="space-y-2">
              <p className="text-sm text-gray-500">联系地址</p>
              <Input
                value={form.address}
                onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))}
                placeholder="请输入联系地址"
              />
            </div>
            <div className="text-sm text-gray-500">
              * 邮箱与密码修改请联系管理员或使用找回流程
            </div>
            <Button type="submit" disabled={saving}>
              {saving ? '保存中...' : '保存修改'}
            </Button>
          </form>
        </CardContent>
      </Card>

      {(user.judgeId || user.prosecutorId || user.lawyerId) && (
        <Card>
          <CardHeader>
            <CardTitle>专业信息</CardTitle>
            <CardDescription>您的专业资格信息</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {user.judgeId && (
              <div>
                <p className="text-sm text-gray-500">司法系统内部账号</p>
                <p className="font-medium">{user.judgeId}</p>
              </div>
            )}

            {user.prosecutorId && (
              <div>
                <p className="text-sm text-gray-500">执业证编号</p>
                <p className="font-medium">{user.prosecutorId}</p>
              </div>
            )}

            {user.department && (
              <div>
                <p className="text-sm text-gray-500">办案部门</p>
                <p className="font-medium">{user.department}</p>
              </div>
            )}

            {user.lawyerId && (
              <div>
                <p className="text-sm text-gray-500">律师执业证号</p>
                <p className="font-medium">{user.lawyerId}</p>
              </div>
            )}

            {user.lawFirm && (
              <div>
                <p className="text-sm text-gray-500">所属律师事务所</p>
                <p className="font-medium">{user.lawFirm}</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
    </MainLayout>
  )
}

