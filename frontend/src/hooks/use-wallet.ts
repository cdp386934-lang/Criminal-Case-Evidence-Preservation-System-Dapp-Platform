import { useState, useEffect, useCallback } from 'react'
import { connectWallet, getCurrentAccount, disconnectWallet } from '../lib/blockchain'

interface UseWalletReturn {
  walletAddress: string | null
  isConnecting: boolean
  isConnected: boolean
  error: string | null
  connect: () => Promise<void>
  disconnect: () => Promise<void>
  refresh: () => Promise<void>
}

/**
 * 钱包管理 Hook
 * 提供钱包连接、断开、状态管理等功能
 * 自动监听 MetaMask 账户切换和断开事件
 */
export function useWallet(): UseWalletReturn {
  const [walletAddress, setWalletAddress] = useState<string | null>(null)
  const [isConnecting, setIsConnecting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // 检查钱包连接状态
  const checkWalletConnection = useCallback(async () => {
    try {
      const account = await getCurrentAccount()
      if (account) {
        setWalletAddress(account)
        setError(null)
        console.log('✅ [钱包] 检测到已连接的钱包:', account)
      } else {
        setWalletAddress(null)
        console.log('ℹ️ [钱包] 未检测到已连接的钱包')
      }
    } catch (err) {
      console.log('ℹ️ [钱包] 检查钱包连接状态时出错:', err)
      setWalletAddress(null)
    }
  }, [])

  // 连接钱包
  const connect = useCallback(async () => {
    setIsConnecting(true)
    setError(null)
    
    try {
      console.log('🔗 [钱包] 开始连接钱包...')
      const address = await connectWallet()
      
      if (address) {
        setWalletAddress(address)
        setError(null)
        console.log('✅ [钱包] 钱包连接成功:', address)
      } else {
        throw new Error('未获取到钱包地址')
      }
    } catch (err: any) {
      const errorMsg = err.message || '钱包连接失败'
      setError(errorMsg)
      setWalletAddress(null)
      console.error('❌ [钱包] 钱包连接失败:', err)
      throw err
    } finally {
      setIsConnecting(false)
    }
  }, [])

  // 断开钱包
  const disconnect = useCallback(async () => {
    try {
      console.log('🔌 [钱包] 开始断开钱包连接...')
      await disconnectWallet()
      setWalletAddress(null)
      setError(null)
      console.log('✅ [钱包] 钱包已断开连接')
    } catch (err: any) {
      const errorMsg = err.message || '断开钱包失败'
      setError(errorMsg)
      console.error('❌ [钱包] 断开钱包失败:', err)
    }
  }, [])

  // 刷新钱包状态
  const refresh = useCallback(async () => {
    await checkWalletConnection()
  }, [checkWalletConnection])

  // 初始化时检查钱包连接状态
  useEffect(() => {
    checkWalletConnection()
  }, [checkWalletConnection])

  // 监听 MetaMask 账户切换事件
  useEffect(() => {
    if (typeof window === 'undefined' || !window.ethereum) {
      return
    }

    const handleAccountsChanged = (accounts: string[]) => {
      console.log('🔄 [钱包] 账户已切换:', accounts)
      if (accounts.length === 0) {
        // 用户断开钱包
        setWalletAddress(null)
        setError(null)
        console.log('ℹ️ [钱包] 用户已断开钱包')
      } else {
        // 用户切换账户
        const newAddress = accounts[0]
        setWalletAddress(newAddress)
        setError(null)
        console.log('✅ [钱包] 已切换到新账户:', newAddress)
      }
    }

    // 监听账户切换
    window.ethereum.on('accountsChanged', handleAccountsChanged)

    // 监听断开事件（某些钱包提供）
    const handleDisconnect = () => {
      console.log('🔌 [钱包] 钱包已断开')
      setWalletAddress(null)
      setError(null)
    }

    // 注意：MetaMask 可能不支持 'disconnect' 事件，但某些钱包支持
    if (window.ethereum.on) {
      try {
        window.ethereum.on('disconnect', handleDisconnect)
      } catch (e) {
        // 某些钱包可能不支持 disconnect 事件
        console.log('ℹ️ [钱包] 当前钱包不支持 disconnect 事件')
      }
    }

    // 清理函数
    return () => {
      if (window.ethereum && window.ethereum.removeListener) {
        window.ethereum.removeListener('accountsChanged', handleAccountsChanged)
        try {
          window.ethereum.removeListener('disconnect', handleDisconnect)
        } catch (e) {
          // 忽略错误
        }
      }
    }
  }, [])

  return {
    walletAddress,
    isConnecting,
    isConnected: !!walletAddress,
    error,
    connect,
    disconnect,
    refresh,
  }
}

