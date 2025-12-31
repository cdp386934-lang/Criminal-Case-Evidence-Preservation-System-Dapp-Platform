'use client'

import { useEffect, useState } from 'react'
import { NotificationApi } from '@/src/api/notification.api'
import DashboardLayout from '@/src/components/layouts/dashboard-layout'
import toast from 'react-hot-toast'
import { format } from 'date-fns'
import Link from 'next/link'

interface Notification {
  _id: string
  userId: { name: string; email: string; role: string }
  senderId?: { name: string; email: string; role: string }
  type: string
  title: string
  content: string
  priority: string
  relatedCaseId?: { caseNumber: string; caseTitle: string }
  relatedEvidenceId?: { evidenceId: string; title: string }
  relatedObjectionId?: { objectionId: string }
  isRead: boolean
  pushStatus: string
  createdAt: string
  readAt?: string
}

export default function AdminNotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(20)
  const [total, setTotal] = useState(0)
  const [filters, setFilters] = useState({
    isRead: '',
    userId: '',
    type: '',
    priority: '',
  })

  useEffect(() => {
    loadNotifications()
  }, [page, pageSize, filters])

  const loadNotifications = async () => {
    try {
      setLoading(true)
      const params: any = {
        page,
        pageSize,
      }
      if (filters.isRead !== '') params.isRead = filters.isRead
      if (filters.userId) params.userId = filters.userId
      if (filters.type) params.type = filters.type
      if (filters.priority) params.priority = filters.priority

      const response = await NotificationApi.listAdminNotifications(params)
      setNotifications(response.data.items || [])
      setTotal(response.data.total || 0)
    } catch (error: any) {
      toast.error(error.response?.data?.error || '加载通知失败')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('确定要删除这条通知吗？')) return

    try {
      await NotificationApi.deleteNotification(id)
      toast.success('删除成功')
      loadNotifications()
    } catch (error: any) {
      toast.error(error.response?.data?.error || '删除失败')
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return 'bg-red-100 text-red-800'
      case 'high':
        return 'bg-orange-100 text-orange-800'
      case 'normal':
        return 'bg-blue-100 text-blue-800'
      case 'low':
        return 'bg-gray-100 text-gray-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <DashboardLayout>
      <div className="px-4 py-6 sm:px-0">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">通知管理</h2>
          <Link
            href="/dashboard/admin/notifications/create"
            className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
          >
            创建通知
          </Link>
        </div>

        {/* 筛选器 */}
        <div className="bg-white p-4 rounded-lg shadow mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                已读状态
              </label>
              <select
                value={filters.isRead}
                onChange={(e) => setFilters({ ...filters, isRead: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              >
                <option value="">全部</option>
                <option value="true">已读</option>
                <option value="false">未读</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                通知类型
              </label>
              <select
                value={filters.type}
                onChange={(e) => setFilters({ ...filters, type: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              >
                <option value="">全部</option>
                <option value="case_created">案件创建</option>
                <option value="evidence_uploaded">证据上传</option>
                <option value="objection_submitted">质证提交</option>
                <option value="case_submitted">案件提交</option>
                <option value="case_closed">案件结案</option>
                <option value="system_notification">系统通知</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                优先级
              </label>
              <select
                value={filters.priority}
                onChange={(e) => setFilters({ ...filters, priority: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              >
                <option value="">全部</option>
                <option value="urgent">紧急</option>
                <option value="high">高</option>
                <option value="normal">普通</option>
                <option value="low">低</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                用户ID
              </label>
              <input
                type="text"
                value={filters.userId}
                onChange={(e) => setFilters({ ...filters, userId: e.target.value })}
                placeholder="输入用户ID"
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>
          </div>
        </div>

        {/* 通知列表 */}
        {loading ? (
          <div className="text-center py-12">加载中...</div>
        ) : notifications.length === 0 ? (
          <div className="text-center py-12 text-gray-500">暂无通知</div>
        ) : (
          <>
            <div className="bg-white shadow overflow-hidden sm:rounded-md">
              <ul className="divide-y divide-gray-200">
                {notifications.map((notification) => (
                  <li key={notification._id} className="px-6 py-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span
                            className={`px-2 py-1 text-xs rounded ${getPriorityColor(
                              notification.priority
                            )}`}
                          >
                            {notification.priority}
                          </span>
                          {!notification.isRead && (
                            <span className="px-2 py-1 text-xs bg-red-100 text-red-800 rounded">
                              未读
                            </span>
                          )}
                          <span className="text-sm text-gray-500">
                            {format(new Date(notification.createdAt), 'yyyy-MM-dd HH:mm')}
                          </span>
                        </div>
                        <h3 className="text-lg font-medium text-gray-900">
                          {notification.title}
                        </h3>
                        <p className="mt-1 text-sm text-gray-600">{notification.content}</p>
                        <div className="mt-2 text-xs text-gray-500">
                          <span>接收者: {notification.userId.name} ({notification.userId.role})</span>
                          {notification.senderId && (
                            <span className="ml-4">
                              发送者: {notification.senderId.name} ({notification.senderId.role})
                            </span>
                          )}
                          {notification.relatedCaseId && (
                            <div className="mt-1">
                              关联案件: {notification.relatedCaseId.caseNumber} -{' '}
                              {notification.relatedCaseId.caseTitle}
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="ml-4 flex gap-2">
                        <button
                          onClick={() => handleDelete(notification._id)}
                          className="px-3 py-1 text-sm bg-red-100 text-red-800 rounded hover:bg-red-200"
                        >
                          删除
                        </button>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            {/* 分页 */}
            <div className="mt-4 flex justify-between items-center">
              <div className="text-sm text-gray-700">
                共 {total} 条，第 {page} / {Math.ceil(total / pageSize)} 页
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="px-4 py-2 border rounded disabled:opacity-50"
                >
                  上一页
                </button>
                <button
                  onClick={() => setPage((p) => p + 1)}
                  disabled={page >= Math.ceil(total / pageSize)}
                  className="px-4 py-2 border rounded disabled:opacity-50"
                >
                  下一页
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </DashboardLayout>
  )
}

