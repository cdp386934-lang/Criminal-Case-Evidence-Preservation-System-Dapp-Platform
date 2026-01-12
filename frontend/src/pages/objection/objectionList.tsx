'use client'

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { Objection } from '@/src/models/objection.model';
import { useAuthStore } from '@/store/authStore';
import { ObjectionApi } from '@/src/api/objection.api';
import RoleGuard from '@/src/components/role-guard';

export default function ObjectionList() {
  const searchParams = useSearchParams();
  const caseId = searchParams.get('caseId') || undefined;
  const evidenceId = searchParams.get('evidenceId') || undefined;
  const { user } = useAuthStore();
  const [objections, setObjections] = useState<Objection[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadObjections();
  }, [caseId, evidenceId]);

  const loadObjections = async () => {
    try {
      setLoading(true);
      const response = await ObjectionApi.list({
        caseId: caseId || undefined,
        evidenceId: evidenceId || undefined,
      });
      setObjections(response.data.data || []);
    } catch (error: any) {
      toast.error(error.response?.data?.message || '加载失败');
    } finally {
      setLoading(false);
    }
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      pending: '待处理',
      accepted: '已接受',
      rejected: '已拒绝',
    };
    return labels[status] || status;
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      pending: 'bg-yellow-100 text-yellow-800',
      accepted: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  if (loading) {
    return <div className="text-center py-8">加载中...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">质证意见列表</h1>
        <RoleGuard allow={['lawyer']}>
          {evidenceId && (
            <Link
              href={`/objection/add-objection?evidenceId=${evidenceId}`}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              提交质证意见
            </Link>
          )}
        </RoleGuard>
      </div>

      {objections.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg shadow">
          <p className="text-gray-500">暂无质证意见</p>
          <RoleGuard allow={['lawyer']}>
            {evidenceId && (
              <Link
                href={`/objection/add-objection?evidenceId=${evidenceId}`}
                className="mt-4 inline-block px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                提交第一个质证意见
              </Link>
            )}
          </RoleGuard>
        </div>
      ) : (
        <div className="space-y-4">
          {objections.map((objection) => {
            const caseInfo = typeof objection.caseId === 'object' ? objection.caseId : null;
            const evidenceInfo = typeof objection.evidenceId === 'object' ? objection.evidenceId : null;
            const lawyerInfo = typeof objection.lawyerId === 'object' ? objection.lawyerId : null;

            return (
              <div key={objection._id} className="bg-white rounded-lg shadow p-6">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center space-x-4 mb-2">
                      <h3 className="text-lg font-semibold">质证意见</h3>
                      <span className={`px-2 py-1 rounded text-sm ${getStatusColor(objection.status)}`}>
                        {getStatusLabel(objection.status)}
                      </span>
                    </div>
                    <p className="text-gray-600 mb-4">{objection.content}</p>
                    <div className="grid grid-cols-2 gap-4 text-sm text-gray-500">
                      {caseInfo && (
                        <div>
                          <span className="font-medium">案件：</span>
                          <span>{caseInfo.caseNumber} - {caseInfo.caseTitle}</span>
                        </div>
                      )}
                      {evidenceInfo && (
                        <div>
                          <span className="font-medium">证据：</span>
                          <span>{evidenceInfo.title || evidenceInfo.evidenceId}</span>
                        </div>
                      )}
                      {lawyerInfo && (
                        <div>
                          <span className="font-medium">提交律师：</span>
                          <span>{lawyerInfo.name || lawyerInfo.email}</span>
                        </div>
                      )}
                      <div>
                        <span className="font-medium">提交时间：</span>
                        <span>{new Date(objection.createdAt).toLocaleString()}</span>
                      </div>
                    </div>
                    {objection.handledAt && (
                      <div className="mt-4 p-3 bg-gray-50 rounded">
                        <div className="text-sm">
                          <span className="font-medium">处理结果：</span>
                          <span className={objection.isAccepted ? 'text-green-600' : 'text-red-600'}>
                            {objection.isAccepted ? '已接受' : '已拒绝'}
                          </span>
                        </div>
                        {objection.handleResult && (
                          <p className="mt-1 text-sm text-gray-600">{objection.handleResult}</p>
                        )}
                        <div className="mt-2 text-xs text-gray-500">
                          处理时间：{new Date(objection.handledAt).toLocaleString()}
                        </div>
                      </div>
                    )}
                  </div>
                  <Link
                    href={`/objection/objection-detail?id=${objection._id}`}
                    className="text-blue-600 hover:text-blue-800 ml-4"
                  >
                    查看详情 →
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

