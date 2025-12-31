import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { CorrectionApi } from '../../api/correction.api';
import { EvidenceApi } from '../../api/evidence.api';
import { Evidence } from '../../models/evidence.model';
import FormInput from '../../components/form-input';
import { addCorrection } from '../../lib/blockchain';
import toast from 'react-hot-toast';
import { ethers } from 'ethers';

interface CorrectionForm {
  reason: string;
  file: FileList;
}

export default function AddCorrection() {
  const { evidenceId } = useParams<{ evidenceId: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [evidence, setEvidence] = useState<Evidence | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<CorrectionForm>();

  const file = watch('file');

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
    }
  };

  const onSubmit = async (data: CorrectionForm) => {
    if (!evidenceId || !evidence) {
      toast.error('证据信息不完整');
      return;
    }

    if (!data.file || data.file.length === 0) {
      toast.error('请选择文件');
      return;
    }

    try {
      setLoading(true);
      const fileObj = data.file[0];
      
      // 计算文件哈希
      const hash = ethers.keccak256(ethers.toUtf8Bytes(fileObj.name + fileObj.size + Date.now()));

      // 上传到区块链
      const blockchainEvidenceId = (evidence as any).blockchainEvidenceId || 0;
      if (blockchainEvidenceId > 0) {
        const blockchainResult = await addCorrection(
          blockchainEvidenceId,
          evidence.caseId,
          hash,
          data.reason
        );
        toast.success(`补正已上链，交易哈希: ${blockchainResult.txHash.slice(0, 10)}...`);
      }

      // 保存到后端
      const payload = {
        caseId: evidence.caseId,
        originalEvidenceId: evidenceId,
        reason: data.reason,
        fileHash: hash,
      };

      await CorrectionApi.create(payload);
      toast.success('补正添加成功');
      navigate(`/evidence/${evidenceId}/corrections`);
    } catch (error: any) {
      toast.error(error.response?.data?.message || error.message || '添加失败');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">添加补正</h1>
      <form onSubmit={handleSubmit(onSubmit)} className="max-w-2xl bg-white p-6 rounded-lg shadow">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              补正原因 <span className="text-red-500">*</span>
            </label>
            <textarea
              {...register('reason', { required: '补正原因是必填项' })}
              rows={6}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="请说明补正的原因..."
            />
            {errors.reason && (
              <p className="mt-1 text-sm text-red-600">{errors.reason.message}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              补正文件 <span className="text-red-500">*</span>
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
            onClick={() => navigate(`/evidence/${evidenceId}/corrections`)}
            className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
          >
            取消
          </button>
        </div>
      </form>
    </div>
  );
}

