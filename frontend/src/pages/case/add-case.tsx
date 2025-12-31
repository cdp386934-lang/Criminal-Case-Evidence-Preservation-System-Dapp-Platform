import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import FormInput from '../../components/form-input';
import toast from 'react-hot-toast';
import { CaseApi } from '@/src/api/case.api';

interface CaseForm {
  caseNumber: string;
  caseTitle: string;
  caseType: string;
  description?: string;
  prosecutorId?: string;
  judgeIds?: string;
  lawyerIds?: string;
}

export default function AddCase() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CaseForm>();

  const onSubmit = async (data: CaseForm) => {
    try {
      setLoading(true);
      const payload = {
        ...data,
        judgeIds: data.judgeIds ? data.judgeIds.split(',').map((id) => id.trim()) : [],
        lawyerIds: data.lawyerIds ? data.lawyerIds.split(',').map((id) => id.trim()) : [],
      };
      await CaseApi.create(payload);
      toast.success('案件创建成功');
      navigate('/cases');
    } catch (error: any) {
      toast.error(error.response?.data?.message || '创建失败');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">创建案件</h1>
      <form onSubmit={handleSubmit(onSubmit)} className="max-w-2xl bg-white p-6 rounded-lg shadow">
        <div className="space-y-4">
          <FormInput
            {...register('caseNumber', { required: '案件编号是必填项' })}
            label="案件编号"
            error={errors.caseNumber?.message}
          />
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
            {...register('prosecutorId')}
            label="检察官ID（可选）"
            error={errors.prosecutorId?.message}
          />
          <FormInput
            {...register('judgeIds')}
            label="法官ID（多个用逗号分隔，可选）"
            error={errors.judgeIds?.message}
          />
          <FormInput
            {...register('lawyerIds')}
            label="律师ID（多个用逗号分隔，可选）"
            error={errors.lawyerIds?.message}
          />
        </div>
        <div className="mt-6 flex space-x-4">
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? '创建中...' : '创建'}
          </button>
          <button
            type="button"
            onClick={() => navigate('/cases')}
            className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
          >
            取消
          </button>
        </div>
      </form>
    </div>
  );
}

