/**
 * 全局组件导出文件
 * 统一导出所有 UI 组件，方便页面使用
 */

// UI 基础组件
export { Button } from './ui/button'
export type { ButtonProps } from './ui/button'

export { Input } from './ui/input'
export type { InputProps } from './ui/input'

export { Label } from './ui/label'
export type { LabelProps } from './ui/label'

export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent } from './ui/card'

export { Tabs, TabsList, TabsTrigger, TabsContent } from './ui/tabs'

// 布局组件
export { default as DashboardLayout } from './layouts/dashboard-layout'
export { default as MainLayout } from './layouts/main-layout'
export { default as ProtectedRoute } from './layouts/protect-router'

// 功能组件
export { default as WalletConnect } from './wallet-connect'
export { default as FormInput } from './form-input'
export { default as RoleGuard } from './role-guard'
export { default as CaseWorkflow } from './case-work-flow'
export { default as TimelineViewer } from './timeline-viewer'
export { default as NotificationBell } from './layouts/notification-bell'

