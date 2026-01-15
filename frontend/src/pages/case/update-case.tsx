'use client'

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { Case } from '../../models/case.model';
import { CaseApi } from '../../api/case.api';
import FormInput from '../../components/form-input';

interface CaseForm {
  caseTitle: string;
  caseType: string;
  description?: string;
  judgeIds?: string;
  lawyerIds?: string;
}

export default function UpdateCase() {
  const searchParams = useSearchParams();
  const id = searchParams.get('id');
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [caseData, setCaseData] = useState<Case | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<CaseForm>();

  useEffect(() => {
    if (id) {
      loadCase();
    }
  }, [id]);

  const loadCase = async () => {
    if (!id) return;
    try {
      const response = await CaseApi.getById(id);
      const data = response.data.data;
      setCaseData(data);
      reset({
        caseTitle: data.caseTitle,
        caseType: data.caseType,
        description: data.description || '',
        judgeIds: data.judgeIds?.join(', ') || '',
        lawyerIds: data.lawyerIds?.join(', ') || '',
      });
    } catch (error: any) {
      toast.error(error.response?.data?.message || '加载失败');
      router.push('/case/case-list');
    }
  };

  const onSubmit = async (data: CaseForm) => {
    if (!id) return;
    try {
      setLoading(true);
      const payload = {
        ...data,
        judgeIds: data.judgeIds ? data.judgeIds.split(',').map((id) => id.trim()) : [],
        lawyerIds: data.lawyerIds ? data.lawyerIds.split(',').map((id) => id.trim()) : [],
      };
      await CaseApi.update(id, payload);
      toast.success('案件更新成功');
      router.push(`/case/case-detail?id=${id}`);
    } catch (error: any) {
      toast.error(error.response?.data?.message || '更新失败');
    } finally {
      setLoading(false);
    }
  };

  if (!caseData) {
    return <div className="text-center py-8">加载中...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">更新案件</h1>
      <form onSubmit={handleSubmit(onSubmit)} className="max-w-2xl bg-white p-6 rounded-lg shadow">
        <div className="space-y-4">
          <div>
            <span className="text-gray-600">案件编号：</span>
            <span className="font-medium">{caseData.caseNumber}</span>
          </div>
          <FormInput
            {...register('caseTitle', { required: '案件标题是必填项' })}
            label="案件标题"
            error={errors.caseTitle?.message}
          />
          <FormInput
            {...register('caseType', { required: '案件类型是必填项' })}
            label="案件类型"
            error={errors.caseType?.message}
          />
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">案件描述</label>
            <textarea
              {...register('description')}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <FormInput
            {...register('judgeIds')}
            label="法官ID（多个用逗号分隔）"
            error={errors.judgeIds?.message}
          />
          <FormInput
            {...register('lawyerIds')}
            label="律师ID（多个用逗号分隔）"
            error={errors.lawyerIds?.message}
          />
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
            onClick={() => router.push(`/case/case-detail?id=${id}`)}
            className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
          >
            取消
          </button>
        </div>
      </form>
    </div>
  );
}

