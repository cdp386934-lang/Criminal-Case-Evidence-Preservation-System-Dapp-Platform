'use client'

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ObjectionApi } from '@/src/api/objection.api';
import toast from 'react-hot-toast';
import RoleGuard from '@/src/components/role-guard';
import { useAuthStore } from '@/store/authStore';
import { Objection } from '@/src/models/objection.model';


export default function ObjectionDetail() {
  const searchParams = useSearchParams();
  const id = searchParams.get('id');
  const router = useRouter();
  const { user } = useAuthStore();
  const [objection, setObjection] = useState<Objection | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      loadObjection();
    }
  }, [id]);

  const loadObjection = async () => {
    if (!id) return;
    try {
      setLoading(true);
      const response = await ObjectionApi.getById(id);
      setObjection(response.data.data);
    } catch (error: any) {
      toast.error(error.response?.data?.message || '加载失败');
      router.push('/case/case-list');
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

  if (!objection) {
    return <div className="text-center py-8">质证意见不存在</div>;
  }

  const caseInfo = typeof objection.caseId === 'object' ? objection.caseId : null;
  const evidenceInfo = typeof objection.evidenceId === 'object' ? objection.evidenceId : null;
  const lawyerInfo = typeof objection.lawyerId === 'object' ? objection.lawyerId : null;
  const handledByInfo = typeof objection.handledBy === 'object' ? objection.handledBy : null;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6 flex justify-between items-center">
        <h1 className="text-2xl font-bold">质证意见详情</h1>
        <div className="space-x-2">
          {caseInfo && (
            <Link
              to={`/cases/${typeof objection.caseId === 'string' ? objection.caseId : caseInfo._id}`}
              className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
            >
              返回案件
            </Link>
          )}
          <Link
            to={`/evidence/${typeof objection.evidenceId === 'string' ? objection.evidenceId : evidenceInfo?._id}/objections`}
            className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
          >
            返回列表
          </Link>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow space-y-6">
        <div>
          <div className="flex items-center space-x-4 mb-4">
            <h2 className="text-xl font-semibold">基本信息</h2>
            <span className={`px-3 py-1 rounded text-sm font-medium ${getStatusColor(objection.status)}`}>
              {getStatusLabel(objection.status)}
            </span>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {caseInfo && (
              <div>
                <span className="text-gray-600">案件：</span>
                <span className="font-medium ml-2">{caseInfo.caseNumber} - {caseInfo.caseTitle}</span>
              </div>
            )}
            {evidenceInfo && (
              <div>
                <span className="text-gray-600">证据：</span>
                <span className="font-medium ml-2">{evidenceInfo.title || evidenceInfo.evidenceId}</span>
              </div>
            )}
            {lawyerInfo && (
              <div>
                <span className="text-gray-600">提交律师：</span>
                <span className="font-medium ml-2">{lawyerInfo.name || lawyerInfo.email}</span>
              </div>
            )}
            <div>
              <span className="text-gray-600">提交时间：</span>
              <span className="font-medium ml-2">{new Date(objection.createdAt).toLocaleString()}</span>
            </div>
          </div>
        </div>

        <div>
          <h3 className="text-lg font-semibold mb-2">质证意见内容</h3>
          <div className="p-4 bg-gray-50 rounded-lg">
            <p className="whitespace-pre-wrap">{objection.content}</p>
          </div>
        </div>

        {objection.handledAt && (
          <div>
            <h3 className="text-lg font-semibold mb-2">处理结果</h3>
            <div className="p-4 bg-gray-50 rounded-lg space-y-2">
              <div>
                <span className="text-gray-600">处理状态：</span>
                <span className={`ml-2 font-medium ${objection.isAccepted ? 'text-green-600' : 'text-red-600'}`}>
                  {objection.isAccepted ? '已接受' : '已拒绝'}
                </span>
              </div>
              {objection.handleResult && (
                <div>
                  <span className="text-gray-600">处理说明：</span>
                  <p className="mt-1">{objection.handleResult}</p>
                </div>
              )}
              {handledByInfo && (
                <div>
                  <span className="text-gray-600">处理人：</span>
                  <span className="font-medium ml-2">{handledByInfo.name || handledByInfo.email}</span>
                </div>
              )}
              <div>
                <span className="text-gray-600">处理时间：</span>
                <span className="font-medium ml-2">{new Date(objection.handledAt).toLocaleString()}</span>
              </div>
            </div>
          </div>
        )}

        {objection.status === 'pending' && user?.role === 'judge' && (
          <div>
            <Link
              to={`/objections/${id}/handle`}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              处理质证意见
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

