'use client'

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import FormInput from '../../components/form-input';
import toast from 'react-hot-toast';
import { CaseApi } from '../../api/case.api';
import { UserApi } from '../../api/user-api';
import { User } from '../../models/user.model';

interface CaseForm {
  caseNumber: string;
  caseTitle: string;
  caseType: string;
  description?: string;
  prosecutorIds?: string[];
  judgeIds?: string[];
  lawyerIds?: string[];
}

export default function AddCase() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
  } = useForm<CaseForm>({
    defaultValues: {
      prosecutorIds: [],
      judgeIds: [],
      lawyerIds: [],
    },
  });

  // 监听表单字段变化
  const selectedProsecutorIds = watch('prosecutorIds') || [];
  const selectedJudgeIds = watch('judgeIds') || [];
  const selectedLawyerIds = watch('lawyerIds') || [];

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setLoadingUsers(true);
      const response = await UserApi.listUsers();
      setUsers(response.data.data || []);
    } catch (error: any) {
      toast.error(error.response?.data?.error || '加载用户列表失败');
    } finally {
      setLoadingUsers(false);
    }
  };

  // 按角色筛选用户
  const prosecutors = users.filter((u) => u.role === 'prosecutor');
  const judges = users.filter((u) => u.role === 'judge');
  const lawyers = users.filter((u) => u.role === 'lawyer');

  // 处理多选变化
  const handleMultiSelectChange = (
    field: 'prosecutorIds' | 'judgeIds' | 'lawyerIds',
    event: React.ChangeEvent<HTMLSelectElement>
  ) => {
    const selectedValues = Array.from(event.target.selectedOptions).map(
      (option) => option.value
    );
    setValue(field, selectedValues);
  };

  const onSubmit = async (data: CaseForm) => {
    try {
      setLoading(true);
      const payload = {
        caseNumber: data.caseNumber,
        caseTitle: data.caseTitle,
        caseType: data.caseType,
        description: data.description,
        prosecutorIds: data.prosecutorIds || [],
        judgeIds: data.judgeIds || [],
        lawyerIds: data.lawyerIds || [],
      };
      await CaseApi.create(payload);
      toast.success('案件创建成功');
      router.push('/case/case-list');
    } catch (error: any) {
      toast.error(error.response?.data?.message || '创建失败');
      console.error('创建案件失败:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">创建案件</h1>
        <p className="text-gray-600 mt-2">请填写案件信息，带 * 的为必填项</p>
      </div>
      
      <form onSubmit={handleSubmit(onSubmit)} className="bg-white p-8 rounded-lg shadow-lg">
        <div className="space-y-6">
          {/* 基本信息 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormInput
              {...register('caseNumber', { required: '案件编号是必填项' })}
              label="案件编号"
              error={errors.caseNumber?.message}
              required
            />
            <FormInput
              {...register('caseTitle', { required: '案件标题是必填项' })}
              label="案件标题"
              error={errors.caseTitle?.message}
              required
            />
          </div>

          <FormInput
            {...register('caseType', { required: '案件类型是必填项' })}
            label="案件类型"
            error={errors.caseType?.message}
            required
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              案件描述
            </label>
            <textarea
              {...register('description')}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="请输入案件描述..."
            />
          </div>

          {/* 人员选择 */}
          <div className="border-t pt-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">相关人员</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* 检察官选择 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  检察官
                </label>
                {loadingUsers ? (
                  <div className="text-sm text-gray-500">加载中...</div>
                ) : (
                  <select
                    multiple
                    size={5}
                    value={selectedProsecutorIds}
                    onChange={(e) => handleMultiSelectChange('prosecutorIds', e)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                  >
                    {prosecutors.length === 0 ? (
                      <option disabled>暂无检察官</option>
                    ) : (
                      prosecutors.map((user) => (
                        <option key={user._id || user.id} value={user._id || user.id}>
                          {user.name} ({user._id || user.id})
                        </option>
                      ))
                    )}
                  </select>
                )}
                {selectedProsecutorIds.length > 0 && (
                  <p className="text-xs text-gray-500 mt-1">
                    已选择 {selectedProsecutorIds.length} 位检察官
                  </p>
                )}
              </div>

              {/* 法官选择 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  法官
                </label>
                {loadingUsers ? (
                  <div className="text-sm text-gray-500">加载中...</div>
                ) : (
                  <select
                    multiple
                    size={5}
                    value={selectedJudgeIds}
                    onChange={(e) => handleMultiSelectChange('judgeIds', e)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                  >
                    {judges.length === 0 ? (
                      <option disabled>暂无法官</option>
                    ) : (
                      judges.map((user) => (
                        <option key={user._id || user.id} value={user._id || user.id}>
                          {user.name} ({user._id || user.id})
                        </option>
                      ))
                    )}
                  </select>
                )}
                {selectedJudgeIds.length > 0 && (
                  <p className="text-xs text-gray-500 mt-1">
                    已选择 {selectedJudgeIds.length} 位法官
                  </p>
                )}
              </div>

              {/* 律师选择 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  律师
                </label>
                {loadingUsers ? (
                  <div className="text-sm text-gray-500">加载中...</div>
                ) : (
                  <select
                    multiple
                    size={5}
                    value={selectedLawyerIds}
                    onChange={(e) => handleMultiSelectChange('lawyerIds', e)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                  >
                    {lawyers.length === 0 ? (
                      <option disabled>暂无律师</option>
                    ) : (
                      lawyers.map((user) => (
                        <option key={user._id || user.id} value={user._id || user.id}>
                          {user.name} ({user._id || user.id})
                        </option>
                      ))
                    )}
                  </select>
                )}
                {selectedLawyerIds.length > 0 && (
                  <p className="text-xs text-gray-500 mt-1">
                    已选择 {selectedLawyerIds.length} 位律师
                  </p>
                )}
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              提示：按住 Ctrl (Windows) 或 Cmd (Mac) 键可多选
            </p>
          </div>
        </div>

        {/* 按钮组 */}
        <div className="mt-8 flex justify-end space-x-4 pt-6 border-t">
          <button
            type="button"
            onClick={() => router.push('/case/case-list')}
            className="px-6 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors font-medium"
          >
            取消
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
          >
            {loading ? '创建中...' : '创建案件'}
          </button>
        </div>
      </form>
    </div>
  );
}

