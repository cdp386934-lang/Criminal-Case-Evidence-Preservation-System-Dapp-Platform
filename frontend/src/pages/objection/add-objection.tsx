'use client'

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { ObjectionApi } from '@/src/api/objection.api';
import { EvidenceApi } from '@/src/api/evidence.api';
import { Evidence } from '@/src/models/evidence.model';
import FormInput from '@/src/components/form-input';
import toast from 'react-hot-toast';
import RoleGuard from '@/src/components/role-guard';

interface ObjectionForm {
  content: string;
}

export default function AddObjection() {
  const searchParams = useSearchParams();
  const evidenceId = searchParams.get('evidenceId');
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [evidence, setEvidence] = useState<Evidence | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ObjectionForm>();

  useEffect(() => {
    if (evidenceId) {
      loadEvidence();
    }
  }, [evidenceId]);

  const loadEvidence = async () => {
    if (!evidenceId) return;
    try {
      const response = await EvidenceApi.getById(evidenceId);
      setEvidence(response.data.data);
    } catch (error: any) {
      toast.error(error.response?.data?.message || '加载证据失败');
      router.push('/case/case-list');
    }
  };

  const onSubmit = async (data: ObjectionForm) => {
    if (!evidenceId || !evidence) {
      toast.error('证据信息不完整');
      return;
    }

    try {
      setLoading(true);
      const payload = {
        caseId: evidence.caseId,
        evidenceId,
        content: data.content,
      };

      await ObjectionApi.create(payload);
      toast.success('质证意见提交成功');
      router.push(`/objection/objectionList?evidenceId=${evidenceId}`);
    } catch (error: any) {
      toast.error(error.response?.data?.message || '提交失败');
    } finally {
      setLoading(false);
    }
  };

  return (
    <RoleGuard allow={['lawyer']}>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6">提交质证意见</h1>
        {evidence && (
          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <h3 className="font-semibold mb-2">相关证据</h3>
            <p className="text-gray-600">{evidence.title}</p>
            {evidence.description && (
              <p className="text-sm text-gray-500 mt-1">{evidence.description}</p>
            )}
          </div>
        )}
        <form onSubmit={handleSubmit(onSubmit)} className="max-w-2xl bg-white p-6 rounded-lg shadow">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                质证意见内容 <span className="text-red-500">*</span>
              </label>
              <textarea
                {...register('content', { required: '质证意见内容是必填项' })}
                rows={8}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="请详细说明您对证据的质证意见..."
              />
              {errors.content && (
                <p className="mt-1 text-sm text-red-600">{errors.content.message}</p>
              )}
            </div>
          </div>
          <div className="mt-6 flex space-x-4">
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? '提交中...' : '提交'}
            </button>
            <button
              type="button"
              onClick={() =>  router.push(`/evidence/${evidenceId}/objections`)}
              className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
            >
              取消
            </button>
          </div>
        </form>
      </div>
    </RoleGuard>
  );
}

