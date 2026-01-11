'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { AuthApi } from '@/api/auth.api'
import { useAuthStore } from '../../store/authStore'
import toast from 'react-hot-toast'
import { Scale } from 'lucide-react'

export default function LoginPage() {
  const router = useRouter()
  const { setUser, setToken } = useAuthStore()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  })

  /**
   * 处理登录表单提交
   * 支持所有角色（法官、检察官、律师）登录
   * 登录成功后会根据角色跳转到相应的仪表板
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    console.log('📝 [登录] 开始登录流程...')
    console.log('📝 [登录] 表单数据:', {
      email: formData.email,
      hasPassword: !!formData.password,
    })

    try {
      console.log('📤 [登录] 发送登录请求...')
      // 调用登录API，后端会验证邮箱和密码
      // 注意：后端使用bcrypt验证密码，支持所有角色登录
      const response = await AuthApi.login({ email: formData.email, password: formData.password })
      
      console.log('✅ [登录] 登录成功:', response)
      console.log('✅ [登录] 响应数据:', response.data)
      console.log('✅ [登录] 响应数据类型:', typeof response.data)
      
      // 处理响应数据：后端可能返回多种格式
      // 格式1: { success: true, data: { user, token }, error: null }
      // 格式2: { user, token } (直接格式)
      // 格式3: 根级别数据
      let authData
      
      // 检查是否是标准格式 { success, data, error }
      if (response.data && typeof response.data === 'object' && 'success' in response.data && 'data' in response.data) {
        // 标准格式：{ success: true, data: { user, token }, error: null }
        authData = response.data.data
        console.log('✅ [登录] 使用标准响应格式, authData:', authData)
      } else if (response.data && typeof response.data === 'object' && 'user' in response.data) {
        // 直接格式：{ user, token }
        authData = response.data
        console.log('✅ [登录] 使用直接响应格式, authData:', authData)
      } else {
        // 尝试从根级别获取
        authData = response.data
        console.log('✅ [登录] 使用根级别数据, authData:', authData)
      }
      
      // 提取用户数据和token
      const userData = authData?.user
      const tokenData = authData?.token
      
      // 验证用户数据是否存在
      if (!userData) {
        console.error('❌ [登录] 用户数据不存在')
        console.error('❌ [登录] 完整响应:', JSON.stringify(response, null, 2))
        console.error('❌ [登录] authData:', authData)
        toast.error('登录响应格式错误，用户信息缺失')
        return
      }
      
      // 保存用户信息和 token 到状态管理
      // 注意：token 也会通过 Cookie 自动保存（后端设置了 HttpOnly Cookie）
      console.log('💾 [登录] 保存用户信息:', userData)
      console.log('💾 [登录] 用户角色:', userData.role)
      setUser(userData)
      
      if (tokenData) {
        console.log('💾 [登录] 保存token到localStorage')
        setToken(tokenData)
      } else {
        console.log('ℹ️ [登录] 未收到token，使用Cookie认证')
      }
      
      // 登录成功，跳转到统一的 dashboard
      // dashboard 页面会根据用户角色（judge/prosecutor/lawyer）显示不同的内容
      toast.success(`登录成功，欢迎 ${userData.name}！`)
      router.push('/dashboard')
    } catch (error: any) {
      console.error('❌ [登录] 登录失败详情:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        statusText: error.response?.statusText,
        headers: error.response?.headers,
      })

      // 详细的错误处理
      // 注意：确保提取的错误消息始终是字符串，不能是对象
      // 后端可能返回格式：{ success: false, data: null, error: { message: "..." } } 或 { error: "..." }
      let errorMessage = '登录失败，请稍后重试'
      
      if (error.response?.data) {
        const errorData = error.response.data
        
        // 处理 error 字段：可能是字符串或对象
        if (errorData.error) {
          if (typeof errorData.error === 'string') {
            // 如果是字符串，直接使用
            errorMessage = errorData.error
          } else if (typeof errorData.error === 'object' && errorData.error !== null) {
            // 如果是对象，尝试提取 message 字段
            if (errorData.error.message) {
              errorMessage = String(errorData.error.message)
            } else {
              // 如果没有 message 字段，尝试序列化对象（仅用于调试）
              errorMessage = '登录失败：' + JSON.stringify(errorData.error)
            }
          }
        } 
        // 处理 errors 数组（express-validator 格式）
        else if (errorData.errors && Array.isArray(errorData.errors)) {
          if (typeof errorData.errors[0] === 'string') {
            errorMessage = errorData.errors[0]
          } else if (errorData.errors[0]?.msg) {
            errorMessage = String(errorData.errors[0].msg)
          } else if (errorData.errors[0]?.message) {
            errorMessage = String(errorData.errors[0].message)
          }
        }
        // 处理直接的消息字段
        else if (errorData.message) {
          errorMessage = String(errorData.message)
        }
      } else if (error.message) {
        // 使用 axios 错误消息
        errorMessage = String(error.message)
      }

      // 确保 errorMessage 始终是字符串（防止React渲染错误）
      if (typeof errorMessage !== 'string') {
        errorMessage = '登录失败，请稍后重试'
      }

      // 在浏览器控制台打印完整错误信息
      console.error('❌ [登录] 错误信息:', JSON.stringify({
        error: errorMessage,
        fullError: error.response?.data,
      }, null, 2))

      // 显示错误提示（确保传递的是字符串）
      toast.error(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background-secondary py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md">
        <CardHeader className="text-left">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-primary-900 rounded flex items-center justify-center">
              <Scale className="w-6 h-6 text-white" />
            </div>
            <div>
              <CardTitle className="text-xl font-semibold text-primary-900">用户登录</CardTitle>
              <CardDescription className="text-sm text-neutral-600 mt-0.5">
                刑事案件链上存证系统
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-1.5">
              <Label htmlFor="email">邮箱地址 *</Label>
              <Input
                id="email"
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="请输入邮箱地址"
                autoComplete="email"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="password">密码 *</Label>
              <Input
                id="password"
                type="password"
                required
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                placeholder="请输入密码"
                autoComplete="current-password"
              />
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full"
              size="lg"
            >
              {loading ? '登录中...' : '登录'}
            </Button>

            <div className="text-center text-sm text-neutral-600 pt-2 border-t border-gray-200">
              还没有账号？{' '}
              <Link
                href="/register"
                className="text-primary-900 hover:text-primary-800 font-medium"
              >
                立即注册
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
