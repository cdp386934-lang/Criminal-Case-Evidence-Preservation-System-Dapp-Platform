'use client'

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { CorrectionApi } from '../../api/correction.api';
import { Correction } from '../../models/corrention.model';

interface CorrectionForm {
  reason?: string;
  status?: 'pending' | 'approved' | 'rejected';
}

export default function UpdateCorrection() {
  const searchParams = useSearchParams();
  const id = searchParams.get('id');
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [correction, setCorrection] = useState<Correction | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<CorrectionForm>();

  useEffect(() => {
    if (id) {
      loadCorrection();
    }
  }, [id]);

  const loadCorrection = async () => {
    if (!id) return;
    try {
      const response = await CorrectionApi.getById(id);
      const data = response.data.data;
      setCorrection(data);
      reset({
        reason: data.reason,
        status: data.status,
      });
    } catch (error: any) {
      toast.error(error.response?.data?.message || '加载失败');
      router.push('/case/case-list');
    }
  };

  const onSubmit = async (data: CorrectionForm) => {
    if (!id) return;
    try {
      setLoading(true);
      await CorrectionApi.update(id, data);
      toast.success('补正更新成功');
      router.push(`/correction/correction-detail?id=${id}`);
    } catch (error: any) {
      toast.error(error.response?.data?.message || '更新失败');
    } finally {
      setLoading(false);
    }
  };

  if (!correction) {
    return <div className="text-center py-8">加载中...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">更新补正</h1>
      <form onSubmit={handleSubmit(onSubmit)} className="max-w-2xl bg-white p-6 rounded-lg shadow">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">补正原因</label>
            <textarea
              {...register('reason')}
              rows={6}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">状态</label>
            <select
              {...register('status')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="pending">待审核</option>
              <option value="approved">已批准</option>
              <option value="rejected">已拒绝</option>
            </select>
          </div>
        </div>
        <div className="mt-6 flex space-x-4">
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? '更新中...' : '更新'}
          </button>
          <button
            type="button"
            onClick={() =>  router.push(`/corrections/${id}`)}
            className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
          >
            取消
          </button>
        </div>
      </form>
    </div>
  );
}

