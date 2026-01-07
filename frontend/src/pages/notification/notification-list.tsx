import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { NotificationApi } from '../../api/notification.api';
import { useAuthStore } from '../../../store/authStore';
import toast from 'react-hot-toast';
import { format } from 'date-fns';

interface Notification {
  _id: string;
  senderId?: { name: string; email: string; role: string };
  type: string;
  title: string;
  content: string;
  priority: string;
  relatedCaseId?: { _id: string; caseNumber: string; caseTitle: string };
  relatedEvidenceId?: { _id: string; evidenceId: string; title: string };
  relatedObjectionId?: { _id: string; objectionId: string };
  isRead: boolean;
  createdAt: string;
  readAt?: string;
}

export default function NotificationList() {
  const { user } = useAuthStore();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [total, setTotal] = useState(0);
  const [unreadCount, setUnreadCount] = useState(0);
  const [filter, setFilter] = useState<'all' | 'unread' | 'read'>('all');

  useEffect(() => {
    loadNotifications();
    loadUnreadCount();
  }, [page, pageSize, filter]);

  const loadNotifications = async () => {
    try {
      setLoading(true);
      const params: any = {
        page,
        pageSize,
      };
      if (filter === 'unread') {
        params.isRead = false;
      } else if (filter === 'read') {
        params.isRead = true;
      }
      const response = await NotificationApi.list(params);
      setNotifications(response.data.data?.items || response.data.data || []);
      setTotal(response.data.data?.total || 0);
    } catch (error: any) {
      toast.error(error.response?.data?.error || '加载通知失败');
    } finally {
      setLoading(false);
    }
  };

  const loadUnreadCount = async () => {
    try {
      const response = await NotificationApi.getUnreadCount();
      setUnreadCount(response.data.count || 0);
    } catch (error) {
      // 忽略错误
    }
  };

  const handleMarkAsRead = async (id: string) => {
    try {
      await NotificationApi.markAsRead(id);
      toast.success('已标记为已读');
      loadNotifications();
      loadUnreadCount();
    } catch (error: any) {
      toast.error(error.response?.data?.error || '标记失败');
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await NotificationApi.markAllAsRead();
      toast.success('已全部标记为已读');
      loadNotifications();
      loadUnreadCount();
    } catch (error: any) {
      toast.error(error.response?.data?.error || '标记失败');
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return 'bg-red-100 text-red-800';
      case 'high':
        return 'bg-orange-100 text-orange-800';
      case 'normal':
        return 'bg-blue-100 text-blue-800';
      case 'low':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      case_created: '案件创建',
      evidence_uploaded: '证据上传',
      objection_submitted: '质证提交',
      case_submitted: '案件提交',
      case_closed: '案件结案',
      system_notification: '系统通知',
    };
    return labels[type] || type;
  };

  if (loading && notifications.length === 0) {
    return <div className="text-center py-8">加载中...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">
          我的通知
          {unreadCount > 0 && (
            <span className="ml-2 px-2 py-1 bg-red-500 text-white text-sm rounded-full">
              {unreadCount}
            </span>
          )}
        </h1>
        {unreadCount > 0 && (
          <button
            onClick={handleMarkAllAsRead}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            全部标记为已读
          </button>
        )}
      </div>

      {/* 筛选器 */}
      <div className="bg-white p-4 rounded-lg shadow mb-6">
        <div className="flex gap-4">
          <button
            onClick={() => {
              setFilter('all');
              setPage(1);
            }}
            className={`px-4 py-2 rounded ${
              filter === 'all'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            全部
          </button>
          <button
            onClick={() => {
              setFilter('unread');
              setPage(1);
            }}
            className={`px-4 py-2 rounded ${
              filter === 'unread'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            未读
          </button>
          <button
            onClick={() => {
              setFilter('read');
              setPage(1);
            }}
            className={`px-4 py-2 rounded ${
              filter === 'read'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            已读
          </button>
        </div>
      </div>

      {/* 通知列表 */}
      {notifications.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg shadow">
          <p className="text-gray-500">暂无通知</p>
        </div>
      ) : (
        <>
          <div className="bg-white shadow overflow-hidden sm:rounded-md">
            <ul className="divide-y divide-gray-200">
              {notifications.map((notification) => (
                <li
                  key={notification._id}
                  className={`px-6 py-4 hover:bg-gray-50 ${
                    !notification.isRead ? 'bg-blue-50' : ''
                  }`}
                >
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
                        <span className="px-2 py-1 text-xs bg-gray-100 text-gray-800 rounded">
                          {getTypeLabel(notification.type)}
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
                      <Link
                        to={`/notifications/${notification._id}`}
                        className="block"
                      >
                        <h3 className="text-lg font-medium text-gray-900 hover:text-blue-600">
                          {notification.title}
                        </h3>
                        <p className="mt-1 text-sm text-gray-600">
                          {notification.content}
                        </p>
                      </Link>
                      <div className="mt-2 text-xs text-gray-500">
                        {notification.senderId && (
                          <span>发送者: {notification.senderId.name}</span>
                        )}
                        {notification.relatedCaseId && (
                          <div className="mt-1">
                            关联案件:{' '}
                            <Link
                              to={`/cases/${notification.relatedCaseId._id}`}
                              className="text-blue-600 hover:underline"
                            >
                              {notification.relatedCaseId.caseNumber} -{' '}
                              {notification.relatedCaseId.caseTitle}
                            </Link>
                          </div>
                        )}
                        {notification.relatedEvidenceId && (
                          <div className="mt-1">
                            关联证据:{' '}
                            <Link
                              to={`/evidence/${notification.relatedEvidenceId._id}`}
                              className="text-blue-600 hover:underline"
                            >
                              {notification.relatedEvidenceId.title}
                            </Link>
                          </div>
                        )}
                      </div>
                    </div>
                    {!notification.isRead && (
                      <button
                        onClick={() => handleMarkAsRead(notification._id)}
                        className="ml-4 px-3 py-1 text-sm bg-blue-100 text-blue-800 rounded hover:bg-blue-200"
                      >
                        标记已读
                      </button>
                    )}
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
  );
}

