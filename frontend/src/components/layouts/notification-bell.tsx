'use client'

import { useEffect, useState } from 'react'
import { NotificationApi } from '../../api/notification.api'
import { Bell } from 'lucide-react'
import Link from 'next/link'

export default function NotificationBell() {
  const [unreadCount, setUnreadCount] = useState(0)

  useEffect(() => {
    loadUnreadCount()
    // 每30秒刷新一次
    const interval = setInterval(loadUnreadCount, 30000)
    return () => clearInterval(interval)
  }, [])

  const loadUnreadCount = async () => {
    try {
      const response = await NotificationApi.getUnreadCount()
      setUnreadCount(response.data.count)
    } catch (error) {
      // 静默失败
    }
  }

  return (
    <Link href="/dashboard/notifications" className="relative">
      <Bell className="w-6 h-6 text-neutral-600 hover:text-primary-900 transition-colors" />
      {unreadCount > 0 && (
        <span className="absolute -top-1 -right-1 bg-error text-white text-xs rounded w-5 h-5 flex items-center justify-center font-medium">
          {unreadCount > 9 ? '9+' : unreadCount}
        </span>
      )}
    </Link>
  )
}

