'use client'

import { useAuthStore } from '@/store/authStore'
import { AuthApi } from '../api/auth.api'
import { useRouter } from 'next/navigation'
import { useCallback } from 'react'

/**
 * 认证相关的 Hook
 * 提供登录、注册、登出等功能
 */
export function useAuth() {
  const router = useRouter()
  const { user, token, isAuthenticated, setUser, setToken, logout: logoutStore } = useAuthStore()

  const login = useCallback(async (email: string, password: string) => {
    try {
      const response = await AuthApi.login({ email, password })
      const { user: userData, token: tokenData } = response.data
      
      setUser(userData)
      setToken(tokenData)
      
      return { user: userData, token: tokenData }
    } catch (error: any) {
      throw error
    }
  }, [setUser, setToken])

  const register = useCallback(async (data: any) => {
    try {
      const response = await authApi.register(data)
      const { user: userData, token: tokenData } = response.data
      
      setUser(userData)
      setToken(tokenData)
      
      return { user: userData, token: tokenData }
    } catch (error: any) {
      throw error
    }
  }, [setUser, setToken])

  const logout = useCallback(async () => {
    try {
      await authApi.logout()
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
      logoutStore()
      router.push('/login')
    }
  }, [logoutStore, router])

  const checkAuth = useCallback(async () => {
    try {
      const userData = await authApi.getMe()
      setUser(userData.data)
      return true
    } catch (error) {
      logoutStore()
      return false
    }
  }, [setUser, logoutStore])

  return {
    user,
    token,
    isAuthenticated,
    login,
    register,
    logout,
    checkAuth,
  }
}

