'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '../../store/authStore'

export default function IndexPage() {
  const router = useRouter()
  const { user, isAuthenticated } = useAuthStore()

  useEffect(() => {
    // 检查认证状态，已登录跳转到工作台，未登录跳转到登录页
    if (isAuthenticated && user) {
      router.replace('/dashboard')
    } else {
      router.replace('/login')
    }
  }, [isAuthenticated, user, router])

  return (
    <div className="flex items-center justify-center min-h-screen bg-background-secondary">
      <div className="text-center">
        <h1 className="text-2xl font-semibold text-primary-900 mb-4">刑事案件链上存证系统</h1>
        <div className="animate-spin rounded h-12 w-12 border-2 border-primary-900 border-t-transparent mx-auto mt-4"></div>
        <p className="mt-4 text-neutral-600">正在加载...</p>
      </div>
    </div>
  )
}

