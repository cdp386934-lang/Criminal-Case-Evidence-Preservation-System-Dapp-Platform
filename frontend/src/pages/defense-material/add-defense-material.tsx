'use client'

import { useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { ethers } from 'ethers';
import { uploadMaterial } from '@/src/lib/blockchain';
import RoleGuard from '@/src/components/role-guard';
import FormInput from '@/src/components/form-input';
import { DefenseMaterialApi } from '@/src/api/defense-material.api';
import { useAuthStore } from '@/store/authStore';


interface MaterialForm {
  title: string;
  description?: string;
  materialType: string;
  file: FileList;
}

export default function AddDefenseMaterial() {
  const searchParams = useSearchParams();
  const caseId = searchParams.get('caseId');
  const router = useRouter();
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<MaterialForm>();

  const file = watch('file');

  const onSubmit = async (data: MaterialForm) => {
    if (!caseId) {
      toast.error('案件ID不存在');
      return;
    }

    if (!user || user.role !== 'lawyer') {
      toast.error('只有律师可以上传辩护材料');
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
      const fileBuffer = await fileObj.arrayBuffer();
      const hash = ethers.keccak256(ethers.toUtf8Bytes(fileObj.name + fileObj.size + Date.now()));

      // 上传到区块链
      const blockchainResult = await uploadMaterial(caseId, hash);
      toast.success(`材料已上链，交易哈希: ${blockchainResult.txHash.slice(0, 10)}...`);

      // 保存到后端
      const payload = {
        caseId,
        title: data.title,
        description: data.description,
        fileHash: hash,
        fileName: fileObj.name,
        fileType: fileObj.type,
        fileSize: fileObj.size,
        materialType: data.materialType,
      };

      await DefenseMaterialApi.create(payload);
      toast.success('辩护材料添加成功');
      router.push(`/defense-material/defense-material-list?caseId=${caseId}`);
    } catch (error: any) {
      toast.error(error.response?.data?.message || error.message || '添加失败');
    } finally {
      setLoading(false);
    }
  };

  return (
    <RoleGuard allow={['lawyer']}>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6">添加辩护材料</h1>
        <form onSubmit={handleSubmit(onSubmit)} className="max-w-2xl bg-white p-6 rounded-lg shadow">
          <div className="space-y-4">
            <FormInput
              {...register('title', { required: '标题是必填项' })}
              label="材料标题"
              error={errors.title?.message}
            />
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">材料描述</label>
              <textarea
                {...register('description')}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                材料类型 <span className="text-red-500">*</span>
              </label>
              <select
                {...register('materialType', { required: '请选择材料类型' })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">请选择</option>
                <option value="defense">辩护词</option>
                <option value="document">法律文书</option>
                <option value="evidence">证据材料</option>
                <option value="other">其他</option>
              </select>
              {errors.materialType && (
                <p className="mt-1 text-sm text-red-600">{errors.materialType.message}</p>
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
              onClick={() =>  router.push(`/cases/${caseId}/materials`)}
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

