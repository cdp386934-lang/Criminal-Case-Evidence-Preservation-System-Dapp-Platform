'use client'

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { OperationLogsApi } from '../../api/operation-logs.api';
import { OperationLogDTO, OperationType, OperationTargetType, ListOperationLogsParams } from '../../models/operation-logs.model';
import { useAuthStore } from '../../../store/authStore';
import toast from 'react-hot-toast';

export default function OperationLogsList() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [logs, setLogs] = useState<OperationLogDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [total, setTotal] = useState(0);
  const [filters, setFilters] = useState<ListOperationLogsParams>({});

  useEffect(() => {
    // 检查是否为管理员
    if (user?.role !== 'admin') {
      toast.error('无权限访问');
      router.push('/dashboard');
      return;
    }
    loadLogs();
  }, [page, pageSize, filters, user,  router.push]);

  const loadLogs = async () => {
    try {
      setLoading(true);
      const params: ListOperationLogsParams = {
        page,
        pageSize,
        ...filters,
      };
      const response = await OperationLogsApi.listOperationLogs(params);
      setLogs(response.data.items || []);
      setTotal(response.data.total || 0);
    } catch (error: any) {
      toast.error(error.response?.data?.error || '加载操作日志失败');
    } finally {
      setLoading(false);
    }
  };

  const getOperationTypeLabel = (type: OperationType) => {
    const labels: Record<OperationType, string> = {
      [OperationType.EVIDENCE_UPLOAD]: '证据上传',
      [OperationType.EVIDENCE_VERIFY]: '证据验证',
      [OperationType.EVIDENCE_CORRECT]: '证据修正',
      [OperationType.OBJECTION_SUBMIT]: '质证提交',
      [OperationType.OBJECTION_HANDLE]: '质证处理',
      [OperationType.CASE_CREATE]: '案件创建',
      [OperationType.CASE_UPDATE]: '案件更新',
      [OperationType.CASE_DELETE]: '案件删除',
    };
    return labels[type] || type;
  };

  const getTargetTypeLabel = (type: OperationTargetType) => {
    const labels: Record<OperationTargetType, string> = {
      [OperationTargetType.CASE]: '案件',
      [OperationTargetType.EVIDENCE]: '证据',
      [OperationTargetType.OBJECTION]: '质证',
    };
    return labels[type] || type;
  };

  if (loading && logs.length === 0) {
    return <div className="text-center py-8">加载中...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">操作日志</h1>
      </div>

      {/* 筛选器 */}
      <div className="bg-white p-4 rounded-lg shadow mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              操作类型
            </label>
            <select
              value={filters.operationType || ''}
              onChange={(e) =>
                setFilters({
                  ...filters,
                  operationType: e.target.value as OperationType || undefined,
                })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            >
              <option value="">全部</option>
              {Object.values(OperationType).map((type) => (
                <option key={type} value={type}>
                  {getOperationTypeLabel(type)}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              目标类型
            </label>
            <select
              value={filters.targetType || ''}
              onChange={(e) =>
                setFilters({
                  ...filters,
                  targetType: e.target.value as OperationTargetType || undefined,
                })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            >
              <option value="">全部</option>
              {Object.values(OperationTargetType).map((type) => (
                <option key={type} value={type}>
                  {getTargetTypeLabel(type)}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              用户ID
            </label>
            <input
              type="text"
              value={filters.userId || ''}
              onChange={(e) =>
                setFilters({ ...filters, userId: e.target.value || undefined })
              }
              placeholder="输入用户ID"
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              目标ID
            </label>
            <input
              type="text"
              value={filters.targetId || ''}
              onChange={(e) =>
                setFilters({ ...filters, targetId: e.target.value || undefined })
              }
              placeholder="输入目标ID"
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              开始时间
            </label>
            <input
              type="date"
              value={filters.from || ''}
              onChange={(e) =>
                setFilters({ ...filters, from: e.target.value || undefined })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              结束时间
            </label>
            <input
              type="date"
              value={filters.to || ''}
              onChange={(e) =>
                setFilters({ ...filters, to: e.target.value || undefined })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            />
          </div>
        </div>
        <div className="mt-4">
          <button
            onClick={loadLogs}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            搜索
          </button>
          <button
            onClick={() => {
              setFilters({});
              setPage(1);
            }}
            className="ml-2 px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
          >
            重置
          </button>
        </div>
      </div>

      {/* 日志列表 */}
      {logs.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg shadow">
          <p className="text-gray-500">暂无操作日志</p>
        </div>
      ) : (
        <>
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    操作时间
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    用户
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    操作类型
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    目标类型
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    描述
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    IP地址
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {logs.map((log) => (
                  <tr key={log._id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(log.createdAt).toLocaleString('zh-CN')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {log.userId?.name || '未知'} ({log.userId?.role || '未知'})
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {getOperationTypeLabel(log.operationType)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {getTargetTypeLabel(log.targetType)}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {log.description}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {log.ipAddress || '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
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

