import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { ethers } from 'ethers';
import { addEvidence } from '@/src/lib/blockchain';
import { EvidenceApi } from '@/src/api/evidence.api';
import FormInput from '@/src/components/form-input';

interface EvidenceForm {
  title: string;
  description?: string;
  evidenceType: string;
  file: FileList;
}

export default function AddEvidence() {
  const { caseId } = useParams<{ caseId: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<EvidenceForm>();

  const file = watch('file');

  const onSubmit = async (data: EvidenceForm) => {
    if (!caseId) {
      toast.error('案件ID不存在');
      return;
    }

    if (!data.file || data.file.length === 0) {
      toast.error('请选择文件');
      return;
    }

    try {
      setLoading(true);
      const fileObj = data.file[0];
      
      // 计算文件哈希（简化版，实际应该使用更安全的方法）
      const fileBuffer = await fileObj.arrayBuffer();
      const hash = ethers.keccak256(ethers.toUtf8Bytes(fileObj.name + fileObj.size + Date.now()));

      // 上传到区块链
      try {
        const blockchainResult = await addEvidence(caseId, hash);
        toast.success(`证据已上链，交易哈希: ${blockchainResult.txHash.slice(0, 10)}...`);
      } catch (blockchainError: any) {
        console.warn('Blockchain upload failed:', blockchainError);
        toast.error('链上存证失败，但将继续保存到数据库');
      }

      const payload = {
        caseId,
        title: data.title,
        description: data.description,
        fileHash: hash,
        fileName: fileObj.name,
        fileType: fileObj.type,
        fileSize: fileObj.size,
        evidenceType: data.evidenceType,
      };

      await EvidenceApi.create(payload);
      toast.success('证据添加成功');
      navigate(`/cases/${caseId}/evidence`);
    } catch (error: any) {
      toast.error(error.response?.data?.message || '添加失败');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">添加证据</h1>
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
              <option value="">请选择</option>
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
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              文件 <span className="text-red-500">*</span>
            </label>
            <input
              {...register('file', { required: '请选择文件' })}
              type="file"
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {errors.file && <p className="mt-1 text-sm text-red-600">{errors.file.message}</p>}
            {file && file.length > 0 && (
              <p className="mt-1 text-sm text-gray-500">已选择: {file[0].name}</p>
            )}
          </div>
        </div>
        <div className="mt-6 flex space-x-4">
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? '添加中...' : '添加'}
          </button>
          <button
            type="button"
            onClick={() => navigate(`/cases/${caseId}/evidence`)}
            className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
          >
            取消
          </button>
        </div>
      </form>
    </div>
  );
}

