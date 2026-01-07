'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/src/components/ui/card'
import { Button } from '@/src/components/ui/button'
import { Input } from '@/src/components/ui/input'
import { Label } from '@/src/components/ui/label'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/src/components/ui/tabs'
import { AuthApi } from '../api/auth.api'
import { useWallet } from '../hooks/use-wallet'
import toast from 'react-hot-toast'
import { Scale, Gavel, Briefcase, Wallet, AlertCircle, LogOut, Shield, Settings } from 'lucide-react'

/**
 * Todo：注册中添加字段：进行上传头像
 */
type UserRole = 'judge' | 'prosecutor' | 'lawyer' | 'police' | 'admin'

export default function RegisterPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState<UserRole>('judge')
  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null)

  // 使用钱包管理 Hook
  const {
    walletAddress,
    isConnecting: walletConnecting,
    isConnected: walletConnected,
    error: walletError,
    connect: connectWallet,
    disconnect: disconnectWallet,
  } = useWallet()

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    address: '',
    // 法官字段
    judgeId: '',
    // 检察官字段
    prosecutorId: '',
    department: '',
    // 律师字段
    lawyerId: '',
    lawFirm: '',

    //警察字段
    policeId: '',
    policeStation: '',

    //系统管理员字段
    adminId: '',
  })

  // 连接钱包处理函数
  const handleConnectWallet = async () => {
    try {
      await connectWallet()
      toast.success('钱包连接成功！')
    } catch (error: any) {
      toast.error(error.message || '钱包连接失败')
    }
  }

  // 断开钱包处理函数
  const handleDisconnectWallet = async () => {
    try {
      await disconnectWallet()
      toast.success('钱包已断开连接')
    } catch (error: any) {
      toast.error(error.message || '断开钱包失败')
    }
  }

  const handleTabChange = (value: string) => {
    setActiveTab(value as UserRole)
    // 清空角色特定字段
    setFormData({
      ...formData,
      judgeId: '',
      prosecutorId: '',
      department: '',
      lawyerId: '',
      lawFirm: '',
      policeId: '',
      policeStation: '',
    })
  }

  // 头像选择处理
  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setAvatarFile(file)
      setAvatarPreview(URL.createObjectURL(file))
    } else {
      setAvatarFile(null)
      setAvatarPreview(null)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    console.log('📝 [注册] 开始注册流程...')
    console.log('📝 [注册] 表单数据:', {
      name: formData.name,
      email: formData.email,
      role: activeTab,
      hasPassword: !!formData.password,
      walletAddress,
    })

    // 检查钱包连接
    // 注意：钱包连接是必需的，因为需要在链上授予角色权限
    if (!walletAddress || !walletConnected) {
      let errorMsg = '请先连接MetaMask钱包'

      // 检查是否安装了MetaMask
      if (typeof window !== 'undefined' && !window.ethereum) {
        errorMsg = '未检测到MetaMask钱包，请先安装MetaMask浏览器扩展'
        toast.error(errorMsg, { duration: 5000 })
      } else if (walletError) {
        errorMsg = `钱包连接失败: ${walletError}`
        toast.error(errorMsg, { duration: 5000 })
      } else {
        toast.error(errorMsg, { duration: 5000 })
      }

      setLoading(false)
      console.error('❌ [注册] 钱包未连接', {
        walletAddress,
        walletConnected,
        walletError,
        hasEthereum: typeof window !== 'undefined' && !!window.ethereum,
      })
      return
    }

    // 验证密码确认
    if (formData.password !== formData.confirmPassword) {
      toast.error('两次输入的密码不一致')
      setLoading(false)
      console.error('❌ [注册] 密码不一致')
      return
    }

    // 根据角色验证必填字段
    if (activeTab === 'judge' && !formData.judgeId) {
      toast.error('请输入司法系统内部账号')
      setLoading(false)
      return
    }
    if (activeTab === 'prosecutor' && (!formData.prosecutorId || !formData.department)) {
      toast.error('请输入执业证编号和办案部门')
      setLoading(false)
      return
    }
    if (activeTab === 'lawyer' && (!formData.lawyerId || !formData.lawFirm)) {
      toast.error('请输入律师执业证号和所属律师事务所')
      setLoading(false)
      return
    }
    if (activeTab === 'police' && (!formData.policeId || !formData.policeStation)) {
      toast.error('请输入警号和所属派出所')
      setLoading(false)
      return
    }
    if (activeTab === 'admin' && (!formData.adminId)) {
      toast.error('请输入管理员Id')
      setLoading(false)
      return
    }



    try {
      const registerData: any = {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        role: activeTab,
        phone: formData.phone || undefined,
        address: formData.address || undefined,
        walletAddress: walletAddress, // 添加钱包地址
      }

      // 根据角色添加特定字段
      if (activeTab === 'judge') {
        registerData.judgeId = formData.judgeId
      } else if (activeTab === 'prosecutor') {
        registerData.prosecutorId = formData.prosecutorId
        registerData.department = formData.department
      } else if (activeTab === 'lawyer') {
        registerData.lawyerId = formData.lawyerId
        registerData.lawFirm = formData.lawFirm
      } else if (activeTab === 'police') {
        registerData.policeId = formData.policeId
        registerData.policeStation = formData.policeStation
      } else if (activeTab === 'admin') {
        registerData.adminId = formData.adminId
      }

      console.log('📤 [注册] 发送注册请求:', {
        ...registerData,
        password: '***', // 不打印密码
      })

      // 发送注册请求
      // 注意：后端会验证钱包地址格式，并在链上授予角色权限
      const response = await AuthApi.register(registerData, avatarFile || undefined)

      console.log('✅ [注册] 注册成功:', response.data)

      // 检查响应格式并提取数据
      let responseData = response.data
      if (responseData && typeof responseData === 'object' && 'success' in responseData && 'data' in responseData && ) {
        // 标准格式：{ success: true, data: { user, token }, error: null }
        responseData = responseData.data
      }

      // 显示成功消息，如果链上交易成功则显示交易哈希
      if (responseData?.txHash) {
        toast.success(`注册成功！链上交易哈希: ${responseData.txHash.substring(0, 10)}...`, { duration: 5000 })
      } else {
        toast.success('注册成功！')
      }

      // 注册成功后自动断开钱包连接，允许用户切换钱包重新注册
      try {
        await disconnectWallet()
        console.log('✅ [注册] 已自动断开钱包连接，可以切换钱包重新注册')
      } catch (error) {
        console.error('❌ [注册] 断开钱包时出错:', error)
        // 即使断开失败也继续跳转
      }

      // 清空表单数据
      setFormData({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
        phone: '',
        address: '',
        judgeId: '',
        prosecutorId: '',
        department: '',
        lawyerId: '',
        lawFirm: '',
        policeId: '',
        policeStation: '',
        adminId: '',
      })
      setAvatarFile(null)
      setAvatarPreview(null)

      // 注册成功后跳转到登录页
      setTimeout(() => {
        router.push('/login')
      }, 1500)
    } catch (error: any) {
      console.error('❌ [注册] 注册失败详情:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        statusText: error.response?.statusText,
        headers: error.response?.headers,
      })

      // 详细的错误处理
      // 注意：确保提取的错误消息始终是字符串，不能是对象
      // 后端可能返回格式：{ success: false, data: null, error: { message: "..." } } 或 { error: "..." }
      let errorMessage = '注册失败，请稍后重试'

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
              errorMessage = '注册失败：' + JSON.stringify(errorData.error)
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
        errorMessage = '注册失败，请稍后重试'
      }

      // 在浏览器控制台打印完整错误信息
      console.error('❌ [注册] 错误信息:', JSON.stringify({
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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-2xl shadow-xl">
        <CardHeader className="text-center space-y-1 pb-6">
          <div className="mx-auto mb-4 w-16 h-16 bg-primary-600 rounded-full flex items-center justify-center shadow-lg">
            <Scale className="w-10 h-10 text-white" />
          </div>
          <CardTitle className="text-3xl font-bold text-gray-900">用户注册</CardTitle>
          <CardDescription className="text-base">
            刑事案件链上存证系统 - 请选择您的角色
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
            <TabsList className="w-full mb-6 grid grid-cols-5 gap-2">
              <TabsTrigger value="judge" className="flex items-center gap-2 w-full justify-center">
                <Gavel className="w-4 h-4" />
                法官
              </TabsTrigger>
              <TabsTrigger value="prosecutor" className="flex items-center gap-2 w-full justify-center">
                <Scale className="w-4 h-4" />
                检察官
              </TabsTrigger>
              <TabsTrigger value="lawyer" className="flex items-center gap-2 w-full justify-center">
                <Briefcase className="w-4 h-4" />
                律师
              </TabsTrigger>
              <TabsTrigger value="police" className="flex items-center gap-2 w-full justify-center">
                <Shield className="w-4 h-4" />
                警察
              </TabsTrigger>
              <TabsTrigger value="admin" className="flex items-center gap-2 w-full justify-center">
                <Settings className="w-4 h-4" />
                管理员
              </TabsTrigger>
            </TabsList>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* 钱包连接区域 */}
              <div className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-200">
                <div className="flex items-center justify-between mb-2">
                  <Label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                    <Wallet className="w-4 h-4" />
                    Web3 钱包连接
                  </Label>
                  {walletConnected && (
                    <span className="text-xs text-green-600 font-medium flex items-center gap-1">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      已连接
                    </span>
                  )}
                </div>
                {walletConnected && walletAddress ? (
                  <div className="space-y-2">
                    <div className="text-sm text-gray-600 break-all font-mono bg-white p-2 rounded border">
                      <span className="font-semibold text-gray-700">已连接：</span>
                      {walletAddress}
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={handleConnectWallet}
                        disabled={walletConnecting}
                        className="w-full"
                      >
                        {walletConnecting ? '连接中...' : '切换账户'}
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={handleDisconnectWallet}
                        disabled={walletConnecting}
                        className="w-full text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <LogOut className="w-4 h-4 mr-1" />
                        断开连接
                      </Button>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      注册成功后会自动断开连接，您可以切换钱包重新注册
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Button
                      type="button"
                      onClick={handleConnectWallet}
                      disabled={walletConnecting}
                      className="w-full"
                    >
                      {walletConnecting ? (
                        <>
                          <span className="animate-spin mr-2">⏳</span>
                          连接中...
                        </>
                      ) : (
                        <>
                          <Wallet className="w-4 h-4 mr-2" />
                          连接 MetaMask 钱包
                        </>
                      )}
                    </Button>
                    {walletError && (
                      <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 p-2 rounded">
                        <AlertCircle className="w-4 h-4" />
                        <span>{walletError}</span>
                      </div>
                    )}
                    {!walletError && (
                      <p className="text-xs text-gray-500">
                        请先连接钱包以完成注册
                      </p>
                    )}
                  </div>
                )}
              </div>

              {/* 头像上传 */}
              <div className="space-y-2">
                <Label htmlFor="avatar">头像（可选）</Label>
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden border">
                    {avatarPreview ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={avatarPreview}
                        alt="头像预览"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-gray-400 text-sm">预览</span>
                    )}
                  </div>
                  <Input
                    id="avatar"
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarChange}
                    className="max-w-xs"
                  />
                </div>
              </div>

              {/* 通用字段 */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">真实姓名 *</Label>
                  <Input
                    id="name"
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="请输入真实姓名"
                  />
                </div>

                <div className="space-y-2">
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
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="password">密码 *</Label>
                  <Input
                    id="password"
                    type="password"
                    required
                    minLength={6}
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    placeholder="至少6位字符"
                    autoComplete="new-password"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">确认密码 *</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    required
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                    placeholder="请再次输入密码"
                    autoComplete="new-password"
                  />
                </div>
              </div>
              {/* 角色特定字段 */}
              <TabsContent value="judge" className="mt-0">
                <div className="space-y-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <h3 className="text-sm font-semibold text-blue-900 mb-3 flex items-center gap-2">
                    <svg className="w-4 h-4 text-blue-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    法官信息
                  </h3>
                  <div className="space-y-2 max-w-2xl">
                    <Label htmlFor="judgeId">司法系统内部账号 *</Label>
                    <Input
                      id="judgeId"
                      type="text"
                      required
                      value={formData.judgeId}
                      onChange={(e) => setFormData({ ...formData, judgeId: e.target.value })}
                      placeholder="请输入司法系统内部账号"
                      className="w-full"
                    />
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="prosecutor" className="mt-0">
                <div className="space-y-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <h3 className="text-sm font-semibold text-blue-900 mb-3 flex items-center gap-2">
                    <svg className="w-4 h-4 text-blue-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                    检察官信息
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-3xl">
                    <div className="space-y-2">
                      <Label htmlFor="prosecutorId">执业证编号 *</Label>
                      <Input
                        id="prosecutorId"
                        type="text"
                        required
                        value={formData.prosecutorId}
                        onChange={(e) => setFormData({ ...formData, prosecutorId: e.target.value })}
                        placeholder="请输入执业证编号"
                        className="w-full"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="department">办案部门 *</Label>
                      <Input
                        id="department"
                        type="text"
                        required
                        value={formData.department}
                        onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                        placeholder="请输入办案部门"
                        className="w-full"
                      />
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="lawyer" className="mt-0">
                <div className="space-y-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <h3 className="text-sm font-semibold text-blue-900 mb-3 flex items-center gap-2">
                    <svg className="w-4 h-4 text-blue-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    律师信息
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-3xl">
                    <div className="space-y-2">
                      <Label htmlFor="lawyerId">律师执业证号 *</Label>
                      <Input
                        id="lawyerId"
                        type="text"
                        required
                        value={formData.lawyerId}
                        onChange={(e) => setFormData({ ...formData, lawyerId: e.target.value })}
                        placeholder="请输入律师执业证号"
                        className="w-full"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lawFirm">所属律师事务所 *</Label>
                      <Input
                        id="lawFirm"
                        type="text"
                        required
                        value={formData.lawFirm}
                        onChange={(e) => setFormData({ ...formData, lawFirm: e.target.value })}
                        placeholder="请输入所属律师事务所"
                        className="w-full"
                      />
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="police" className="mt-0">
                <div className="space-y-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <h3 className="text-sm font-semibold text-blue-900 mb-3 flex items-center gap-2">
                    <svg className="w-4 h-4 text-blue-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                    警察信息
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-3xl">
                    <div className="space-y-2">
                      <Label htmlFor="policeId">警察编号 *</Label>
                      <Input
                        id="policeId"
                        type="text"
                        required
                        value={formData.policeId}
                        onChange={(e) => setFormData({ ...formData, policeId: e.target.value })}
                        placeholder="请输入警察编号"
                        className="w-full"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="policeStation">所属警察局 *</Label>
                      <Input
                        id="policeStation"
                        type="text"
                        required
                        value={formData.policeStation}
                        onChange={(e) => setFormData({ ...formData, policeStation: e.target.value })}
                        placeholder="请输入所属警察局"
                        className="w-full"
                      />
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="admin" className="mt-0">
                <div className="space-y-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <h3 className="text-sm font-semibold text-blue-900 mb-3 flex items-center gap-2">
                    <svg className="w-4 h-4 text-blue-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    管理员信息
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-3xl">
                    <div className="space-y-2">
                      <Label htmlFor="adminId">管理员编号 *</Label>
                      <Input
                        id="adminId"
                        type="text"
                        required
                        value={formData.adminId}
                        onChange={(e) => setFormData({ ...formData, adminId: e.target.value })}
                        placeholder="请输入管理员编号"
                        className="w-full"
                      />
                    </div>
                  </div>
                </div>
              </TabsContent>


              {/* 可选字段 */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                <div className="space-y-2">
                  <Label htmlFor="phone">联系电话</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="请输入联系电话（可选）"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="address">联系地址</Label>
                  <Input
                    id="address"
                    type="text"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    placeholder="请输入联系地址（可选）"
                  />
                </div>
              </div>

              <Button
                type="submit"
                disabled={loading || !walletConnected}
                className="w-full mt-6"
                size="lg"
              >
                {loading ? (
                  <>
                    <span className="animate-spin mr-2">⏳</span>
                    注册中...
                  </>
                ) : !walletConnected ? (
                  '请先连接钱包'
                ) : (
                  '立即注册'
                )}
              </Button>

              <div className="text-center text-sm text-gray-600 pt-2">
                已有账号？{' '}
                <a
                  href="/login"
                  className="text-primary-600 hover:text-primary-700 font-medium"
                >
                  立即登录
                </a>
              </div>
            </form>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
