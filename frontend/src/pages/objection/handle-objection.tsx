import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { ObjectionApi } from '@/src/api/objection.api';
import {Objection} from '@/src/models/objection.model'
import FormInput from '@/src/components/form-input';
import toast from 'react-hot-toast';
import RoleGuard from '@/src/components/role-guard';

interface HandleForm {
  isAccepted: boolean;
  handleResult: string;
}

export default function HandleObjection() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [objection, setObjection] = useState<Objection | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<HandleForm>({
    defaultValues: {
      isAccepted: true,
    },
  });

  const isAccepted = watch('isAccepted');

  useEffect(() => {
    if (id) {
      loadObjection();
    }
  }, [id]);

  const loadObjection = async () => {
    if (!id) return;
    try {
      const response = await ObjectionApi.getById(id);
      setObjection(response.data.data);
      if (response.data.data.status !== 'pending') {
        toast.error('该质证意见已被处理');
        navigate(`/objections/${id}`);
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || '加载失败');
      navigate('/cases');
    }
  };

  const onSubmit = async (data: HandleForm) => {
    if (!id) return;
    try {
      setLoading(true);
      await ObjectionApi.handle(id, {
        isAccepted: data.isAccepted,
        handleResult: data.handleResult,
      });
      toast.success('处理成功');
      navigate(`/objections/${id}`);
    } catch (error: any) {
      toast.error(error.response?.data?.message || '处理失败');
    } finally {
      setLoading(false);
    }
  };

  if (!objection) {
    return <div className="text-center py-8">加载中...</div>;
  }

  const caseInfo = typeof objection.caseId === 'object' ? objection.caseId : null;
  const evidenceInfo = typeof objection.evidenceId === 'object' ? objection.evidenceId : null;

  return (
    <RoleGuard allow={['judge']}>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6">处理质证意见</h1>

        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
          <h3 className="font-semibold mb-2">质证意见内容</h3>
          <p className="text-gray-600 mb-4">{objection.content}</p>
          {caseInfo && (
            <p className="text-sm text-gray-500">案件：{caseInfo.caseNumber} - {caseInfo.caseTitle}</p>
          )}
          {evidenceInfo && (
            <p className="text-sm text-gray-500">证据：{evidenceInfo.title || evidenceInfo.evidenceId}</p>
          )}
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="max-w-2xl bg-white p-6 rounded-lg shadow">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                处理决定 <span className="text-red-500">*</span>
              </label>
              <div className="space-y-2">
                <label className="flex items-center">
                  <input
                    {...register('isAccepted', { required: true })}
                    type="radio"
                    value="true"
                    className="mr-2"
                  />
                  <span className="text-green-600 font-medium">接受质证意见</span>
                </label>
                <label className="flex items-center">
                  <input
                    {...register('isAccepted', { required: true })}
                    type="radio"
                    value="false"
                    className="mr-2"
                  />
                  <span className="text-red-600 font-medium">拒绝质证意见</span>
                </label>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                处理说明 <span className="text-red-500">*</span>
              </label>
              <textarea
                {...register('handleResult', { required: '处理说明是必填项' })}
                rows={6}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder={`请详细说明${isAccepted ? '接受' : '拒绝'}该质证意见的理由...`}
              />
              {errors.handleResult && (
                <p className="mt-1 text-sm text-red-600">{errors.handleResult.message}</p>
              )}
            </div>
          </div>

          <div className="mt-6 flex space-x-4">
            <button
              type="submit"
              disabled={loading}
              className={`px-4 py-2 text-white rounded hover:opacity-90 disabled:opacity-50 ${
                isAccepted ? 'bg-green-600' : 'bg-red-600'
              }`}
            >
              {loading ? '处理中...' : `确认${isAccepted ? '接受' : '拒绝'}`}
            </button>
            <button
              type="button"
              onClick={() => navigate(`/objections/${id}`)}
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

