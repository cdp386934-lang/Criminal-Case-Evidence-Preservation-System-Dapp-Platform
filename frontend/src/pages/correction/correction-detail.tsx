'use client'

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Correction } from '../../models/corrention.model';
import RoleGuard from '../../components/role-guard';
import toast from 'react-hot-toast';
import { CorrectionApi } from '@/src/api/correction.api';

export default function CorrectionDetail() {
  const searchParams = useSearchParams();
  const id = searchParams.get('id');
  const router = useRouter();
  const [correction, setCorrection] = useState<Correction | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      loadCorrection();
    }
  }, [id]);

  const loadCorrection = async () => {
    if (!id) return;
    try {
      setLoading(true);
      const response = await CorrectionApi.getById(id);
      setCorrection(response.data.data);
    } catch (error: any) {
      toast.error(error.response?.data?.message || '加载失败');
      router.push('/case/case-list');
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

  if (!correction) {
    return <div className="text-center py-8">补正记录不存在</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6 flex justify-between items-center">
        <h1 className="text-2xl font-bold">补正详情</h1>
        <div className="space-x-2">
          <RoleGuard allow={['prosecutor', 'judge']}>
            <Link
              to={`/corrections/${id}/edit`}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              编辑
            </Link>
          </RoleGuard>
          <Link
            to={`/evidence/${correction.originalEvidenceId}/corrections`}
            className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
          >
            返回列表
          </Link>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow">
        <div className="space-y-4">
          <div>
            <span className="text-gray-600">补正原因：</span>
            <p className="mt-1 font-medium">{correction.reason}</p>
          </div>
          <div>
            <span className="text-gray-600">状态：</span>
            <span className={`px-2 py-1 rounded ml-2 ${
              correction.status === 'approved' ? 'bg-green-100 text-green-800' :
              correction.status === 'rejected' ? 'bg-red-100 text-red-800' :
              'bg-yellow-100 text-yellow-800'
            }`}>
              {getStatusLabel(correction.status)}
            </span>
          </div>
          <div>
            <span className="text-gray-600">文件哈希：</span>
            <span className="font-mono text-sm">{correction.fileHash}</span>
          </div>
          <div>
            <span className="text-gray-600">创建时间：</span>
            <span className="font-medium">{new Date(correction.createdAt).toLocaleString()}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

