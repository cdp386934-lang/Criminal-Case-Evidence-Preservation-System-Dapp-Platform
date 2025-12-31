import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Evidence } from '@/src/models/evidence.model';
import { getEvidence, verifyEvidence } from '@/src/lib/blockchain';
import { EvidenceApi } from '@/src/api/evidence.api';
import RoleGuard from '@/src/components/role-guard';

interface BlockchainEvidence {
  hash: string;
  uploader: string;
  timestamp: number;
}

export default function EvidenceDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [evidence, setEvidence] = useState<Evidence | null>(null);
  const [loading, setLoading] = useState(true);
  const [blockchainData, setBlockchainData] = useState<BlockchainEvidence | null>(null);
  const [verifying, setVerifying] = useState(false);

  useEffect(() => {
    if (id) {
      loadEvidence();
    }
  }, [id]);

  const loadEvidence = async () => {
    if (!id) return;
    try {
      setLoading(true);
      const response = await EvidenceApi.getById(id);
      const evidenceData = response.data.data;
      setEvidence(evidenceData);
      
      // 尝试从区块链获取数据（如果有链上ID）
      // 注意：这里需要根据实际的后端数据结构来调整
      // 如果后端返回了 blockchainEvidenceId，可以使用它来查询
      if ((evidenceData as any).blockchainEvidenceId) {
        try {
          const blockchainResult = await getEvidence((evidenceData as any).blockchainEvidenceId);
          setBlockchainData(blockchainResult);
        } catch (error) {
          console.warn('Failed to load blockchain data:', error);
        }
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || '加载失败');
      navigate('/cases');
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async () => {
    if (!evidence || !blockchainData) return;
    try {
      setVerifying(true);
      const isValid = await verifyEvidence((evidence as any).blockchainEvidenceId || 0, evidence.fileHash);
      if (isValid) {
        toast.success('证据哈希验证通过');
      } else {
        toast.error('证据哈希验证失败');
      }
    } catch (error: any) {
      toast.error(error.message || '验证失败');
    } finally {
      setVerifying(false);
    }
  };

  const handleDelete = async () => {
    if (!id || !window.confirm('确定要删除这个证据吗？')) return;
    try {
      await EvidenceApi.delete(id);
      toast.success('删除成功');
      navigate(`/cases/${evidence?.caseId}/evidence`);
    } catch (error: any) {
      toast.error(error.response?.data?.message || '删除失败');
    }
  };

  if (loading) {
    return <div className="text-center py-8">加载中...</div>;
  }

  if (!evidence) {
    return <div className="text-center py-8">证据不存在</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6 flex justify-between items-center">
        <h1 className="text-2xl font-bold">证据详情</h1>
        <div className="space-x-2">
          <RoleGuard allow={['prosecutor', 'lawyer']}>
            <Link
              to={`/evidence/${id}/edit`}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              编辑
            </Link>
          </RoleGuard>
          <RoleGuard allow={['prosecutor', 'lawyer']}>
            <button
              onClick={handleDelete}
              className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
            >
              删除
            </button>
          </RoleGuard>
          <Link
            to={`/cases/${evidence.caseId}/evidence`}
            className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
          >
            返回列表
          </Link>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow">
        <div className="space-y-4">
          <div>
            <span className="text-gray-600">标题：</span>
            <span className="font-medium text-lg">{evidence.title}</span>
          </div>
          {evidence.description && (
            <div>
              <span className="text-gray-600">描述：</span>
              <p className="mt-1">{evidence.description}</p>
            </div>
          )}
          <div>
            <span className="text-gray-600">证据类型：</span>
            <span className="font-medium">{evidence.evidenceType}</span>
          </div>
          <div>
            <span className="text-gray-600">文件名：</span>
            <span className="font-medium">{evidence.fileName}</span>
          </div>
          <div>
            <span className="text-gray-600">文件哈希：</span>
            <span className="font-mono text-sm">{evidence.fileHash}</span>
          </div>
          <div>
            <span className="text-gray-600">文件大小：</span>
            <span className="font-medium">{(evidence.fileSize / 1024).toFixed(2)} KB</span>
          </div>
          <div>
            <span className="text-gray-600">创建时间：</span>
            <span className="font-medium">{new Date(evidence.createdAt).toLocaleString()}</span>
          </div>
        </div>
      </div>

      {blockchainData && (
        <div className="mt-6 bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">链上存证信息</h2>
          <div className="space-y-3">
            <div>
              <span className="text-gray-600">上传者地址：</span>
              <span className="font-mono text-sm ml-2">{blockchainData.uploader}</span>
            </div>
            <div>
              <span className="text-gray-600">链上时间戳：</span>
              <span className="font-medium ml-2">
                {new Date(blockchainData.timestamp * 1000).toLocaleString()}
              </span>
            </div>
            <div>
              <span className="text-gray-600">链上哈希：</span>
              <span className="font-mono text-sm ml-2">{blockchainData.hash}</span>
            </div>
            <div className="mt-4">
              <button
                onClick={handleVerify}
                disabled={verifying}
                className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
              >
                {verifying ? '验证中...' : '验证哈希'}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="mt-6 bg-white p-6 rounded-lg shadow">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">补正记录</h2>
          <Link
            to={`/evidence/${id}/corrections`}
            className="text-blue-600 hover:text-blue-800"
          >
            查看所有补正 →
          </Link>
        </div>
      </div>
    </div>
  );
}

