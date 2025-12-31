'use client'

import { useState } from 'react'
import { NotificationApi } from '@/src/api/notification.api'
import DashboardLayout from '@/src/components/layouts/dashboard-layout'
import toast from 'react-hot-toast'
import { useRouter } from 'next/navigation'

export default function CreateNotificationPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    type: 'system_notification',
    priority: 'normal',
    targetRoles: [] as string[],
    targetUserIds: '',
    relatedCaseId: '',
    relatedEvidenceId: '',
    relatedObjectionId: '',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.title || !formData.content) {
      toast.error('请填写标题和内容')
      return
    }

    if (formData.targetRoles.length === 0 && !formData.targetUserIds) {
      toast.error('请选择推送目标（角色或用户）')
      return
    }

    setLoading(true)
    try {
      const payload: any = {
        title: formData.title,
        content: formData.content,
        type: formData.type,
        priority: formData.priority,
      }

      if (formData.targetRoles.length > 0) {
        payload.targetRoles = formData.targetRoles
      }

      if (formData.targetUserIds) {
        payload.targetUserIds = formData.targetUserIds
          .split(',')
          .map((id) => id.trim())
          .filter((id) => id)
      }

      if (formData.relatedCaseId) payload.relatedCaseId = formData.relatedCaseId
      if (formData.relatedEvidenceId) payload.relatedEvidenceId = formData.relatedEvidenceId
      if (formData.relatedObjectionId) payload.relatedObjectionId = formData.relatedObjectionId

      await NotificationApi.createNotification(payload)
      toast.success('通知创建成功')
      router.push('/dashboard/admin/notifications')
    } catch (error: any) {
      toast.error(error.response?.data?.error || '创建失败')
    } finally {
      setLoading(false)
    }
  }

  const toggleRole = (role: string) => {
    setFormData((prev) => ({
      ...prev,
      targetRoles: prev.targetRoles.includes(role)
        ? prev.targetRoles.filter((r) => r !== role)
        : [...prev.targetRoles, role],
    }))
  }

  return (
    <DashboardLayout>
      <div className="max-w-3xl mx-auto px-4 py-6">
        <h2 className="text-2xl font-bold mb-6">创建通知</h2>
        <form onSubmit={handleSubmit} className="bg-white shadow rounded-lg p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              标题 *
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              内容 *
            </label>
            <textarea
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              required
              rows={5}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              通知类型
            </label>
            <select
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            >
              <option value="system_notification">系统通知</option>
              <option value="case_created">案件创建</option>
              <option value="evidence_uploaded">证据上传</option>
              <option value="objection_submitted">质证提交</option>
              <option value="case_submitted">案件提交</option>
              <option value="case_closed">案件结案</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              优先级
            </label>
            <select
              value={formData.priority}
              onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            >
              <option value="low">低</option>
              <option value="normal">普通</option>
              <option value="high">高</option>
              <option value="urgent">紧急</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              推送目标（角色）*
            </label>
            <div className="flex flex-wrap gap-2">
              {['police', 'judge', 'prosecutor', 'lawyer', 'admin'].map((role) => (
                <label key={role} className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.targetRoles.includes(role)}
                    onChange={() => toggleRole(role)}
                    className="mr-2"
                  />
                  <span className="text-sm">
                    {role === 'police' ? '公安' : role === 'judge' ? '法官' : role === 'prosecutor' ? '检察官' : role === 'lawyer' ? '律师' : '管理员'}
                  </span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              推送目标（用户ID，逗号分隔）
            </label>
            <input
              type="text"
              value={formData.targetUserIds}
              onChange={(e) => setFormData({ ...formData, targetUserIds: e.target.value })}
              placeholder="例如: user1, user2, user3"
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            />
          </div>

          <div className="flex gap-4">
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50"
            >
              {loading ? '创建中...' : '创建通知'}
            </button>
            <button
              type="button"
              onClick={() => router.back()}
              className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
            >
              取消
            </button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  )
}

