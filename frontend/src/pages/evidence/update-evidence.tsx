import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { EvidenceApi } from '@/src/api/evidence.api';
import { Evidence } from '@/src/models/evidence.model';
import FormInput from '@/src/components/form-input';
import toast from 'react-hot-toast';

interface EvidenceForm {
  title: string;
  description?: string;
  evidenceType: string;
}

export default function UpdateEvidence() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [evidence, setEvidence] = useState<Evidence | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<EvidenceForm>();

  useEffect(() => {
    if (id) {
      loadEvidence();
    }
  }, [id]);

  const loadEvidence = async () => {
    if (!id) return;
    try {
      const response = await EvidenceApi.getById(id);
      const data = response.data.data;
      setEvidence(data);
      reset({
        title: data.title,
        description: data.description || '',
        evidenceType: data.evidenceType,
      });
    } catch (error: any) {
      toast.error(error.response?.data?.message || '加载失败');
      navigate('/cases');
    }
  };

  const onSubmit = async (data: EvidenceForm) => {
    if (!id) return;
    try {
      setLoading(true);
      await EvidenceApi.update(id, data);
      toast.success('证据更新成功');
      navigate(`/evidence/${id}`);
    } catch (error: any) {
      toast.error(error.response?.data?.message || '更新失败');
    } finally {
      setLoading(false);
    }
  };

  if (!evidence) {
    return <div className="text-center py-8">加载中...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">更新证据</h1>
      <form onSubmit={handleSubmit(onSubmit)} className="max-w-2xl bg-white p-6 rounded-lg shadow">
        <div className="space-y-4">
          <FormInput
            {...register('title', { required: '标题是必填项' })}
            label="证据标题"
            error={errors.title?.message}
          />
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">证据描述</label>
            <textarea
              {...register('description')}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              证据类型 <span className="text-red-500">*</span>
            </label>
            <select
              {...register('evidenceType', { required: '请选择证据类型' })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="document">文档</option>
              <option value="audio">音频</option>
              <option value="video">视频</option>
              <option value="image">图片</option>
              <option value="other">其他</option>
            </select>
            {errors.evidenceType && (
              <p className="mt-1 text-sm text-red-600">{errors.evidenceType.message}</p>
            )}
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
            onClick={() => navigate(`/evidence/${id}`)}
            className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
          >
            取消
          </button>
        </div>
      </form>
    </div>
  );
}

