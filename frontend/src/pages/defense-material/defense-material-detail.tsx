'use client'

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { DefenseMaterial } from '@/src/models/defense-material.model';
import { DefenseMaterialApi } from '@/src/api/defense-material.api';

export default function DefenseMaterialDetail() {
  const searchParams = useSearchParams();
  const id = searchParams.get('id');
  const router = useRouter();
  const [material, setMaterial] = useState<DefenseMaterial | null>(null);
  const [loading, setLoading] = useState(true);
  const [blockchainData, setBlockchainData] = useState<any>(null);

  useEffect(() => {
    if (id) {
      loadMaterial();
    }
  }, [id]);

  const loadMaterial = async () => {
    if (!id) return;
    try {
      setLoading(true);
      const response = await DefenseMaterialApi.getById(id);
      setMaterial(response.data.data);
      
      // 尝试从区块链获取数据（如果有链上ID）
      // 注意：这里需要根据实际的后端数据结构来调整
    } catch (error: any) {
      toast.error(error.response?.data?.message || '加载失败');
      router.push('/case/case-list');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="text-center py-8">加载中...</div>;
  }

  if (!material) {
    return <div className="text-center py-8">材料不存在</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6 flex justify-between items-center">
        <h1 className="text-2xl font-bold">辩护材料详情</h1>
        <Link
          to={`/cases/${material.caseId}/materials`}
          className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
        >
          返回列表
        </Link>
      </div>

      <div className="bg-white p-6 rounded-lg shadow">
        <div className="space-y-4">
          <div>
            <span className="text-gray-600">标题：</span>
            <span className="font-medium text-lg">{material.title}</span>
          </div>
          {material.description && (
            <div>
              <span className="text-gray-600">描述：</span>
              <p className="mt-1">{material.description}</p>
            </div>
          )}
          <div>
            <span className="text-gray-600">材料类型：</span>
            <span className="font-medium">{material.materialType}</span>
          </div>
          <div>
            <span className="text-gray-600">文件名：</span>
            <span className="font-medium">{material.fileName}</span>
          </div>
          <div>
            <span className="text-gray-600">文件哈希：</span>
            <span className="font-mono text-sm">{material.fileHash}</span>
          </div>
          <div>
            <span className="text-gray-600">文件大小：</span>
            <span className="font-medium">{(material.fileSize / 1024).toFixed(2)} KB</span>
          </div>
          <div>
            <span className="text-gray-600">创建时间：</span>
            <span className="font-medium">{new Date(material.createdAt).toLocaleString()}</span>
          </div>
        </div>
      </div>

      {blockchainData && (
        <div className="mt-6 bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">链上存证信息</h2>
          <div className="space-y-2">
            <div>
              <span className="text-gray-600">上传者地址：</span>
              <span className="font-mono text-sm">{blockchainData.uploader}</span>
            </div>
            <div>
              <span className="text-gray-600">时间戳：</span>
              <span className="font-medium">
                {new Date(blockchainData.timestamp * 1000).toLocaleString()}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

