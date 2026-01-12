'use client'

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { CorrectionApi } from '@/src/api/correction.api';
import { Correction } from '@/src/models/corrention.model';
import { useAuthStore } from '@/store/authStore';
import toast from 'react-hot-toast';

export default function CorrectionList() {
  const searchParams = useSearchParams();
  const evidenceId = searchParams.get('evidenceId');
  const { user } = useAuthStore();
  const [corrections, setCorrections] = useState<Correction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (evidenceId) {
      loadCorrections();
    }
  }, [evidenceId]);

  const loadCorrections = async () => {
    if (!evidenceId) return;
    try {
      setLoading(true);
      const response = await CorrectionApi.listByEvidence(evidenceId);
      setCorrections(response.data.data || []);
    } catch (error: any) {
      toast.error(error.response?.data?.message || '加载补正列表失败');
      console.error('Failed to load corrections:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      pending: '待审核',
      approved: '已批准',
      rejected: '已拒绝',
    };
    return labels[status] || status;
  };

  if (loading) {
    return <div className="text-center py-8">加载中...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">补正列表</h1>
        {evidenceId && (user?.role === 'police' || user?.role === 'prosecutor') && (
          <Link
            href={`/correction/add-correction?evidenceId=${evidenceId}`}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            添加补正
          </Link>
        )}
      </div>

      {corrections.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg shadow">
          <p className="text-gray-500">暂无补正记录</p>
        </div>
      ) : (
        <div className="space-y-4">
          {corrections.map((correction) => (
            <div key={correction._id} className="bg-white rounded-lg shadow p-6">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold mb-2">补正原因</h3>
                  <p className="text-gray-600 mb-4">{correction.reason}</p>
                  <div className="flex items-center space-x-4 text-sm text-gray-500">
                    <span>文件哈希: <span className="font-mono">{correction.fileHash}</span></span>
                    <span className={`px-2 py-1 rounded ${
                      correction.status === 'approved' ? 'bg-green-100 text-green-800' :
                      correction.status === 'rejected' ? 'bg-red-100 text-red-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {getStatusLabel(correction.status)}
                    </span>
                  </div>
                </div>
                <Link
                  href={`/correction/correction-detail?id=${correction._id}`}
                  className="text-blue-600 hover:text-blue-800"
                >
                  查看详情 →
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

