'use client'

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import FormInput from '../../components/form-input';
import toast from 'react-hot-toast';
import { CaseApi } from '../../api/case.api';
import { UserApi } from '../../api/user-api';
import { User } from '../../models/user.model';
import { CaseType, CreateCaseDTO } from '../../models/case.model';

interface CaseForm {
  caseNumber: string;
  caseTitle: string;
  caseType: CaseType;
  description?: string;
  prosecutorIds?: string[];
  judgeIds?: string[];
  plaintiffLawyerIds?: string[];
  defendantLawyerIds?: string[];
}

export default function CreateCase() {
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
      caseType: 'PUBLIC_PROSECUTION' as CaseType,
      prosecutorIds: [],
      judgeIds: [],
      plaintiffLawyerIds: [],
      defendantLawyerIds: [],
    },
  });

  // 监听表单字段变化
  const selectedCaseType = watch('caseType');
  const selectedProsecutorIds = watch('prosecutorIds') || [];
  const selectedJudgeIds = watch('judgeIds') || [];
  const selectedPlaintiffLawyerIds = watch('plaintiffLawyerIds') || [];
  const selectedDefendantLawyerIds = watch('defendantLawyerIds') || [];

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

  // 获取用户ID的辅助函数（兼容 _id 和 id）
  const getUserId = (user: User): string => {
    return user._id || (user as any).id || '';
  };

  // 处理多选变化
  const handleMultiSelectChange = (
    field: 'prosecutorIds' | 'judgeIds' | 'plaintiffLawyerIds' | 'defendantLawyerIds',
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
      
      // 前端验证：根据案件类型检查必填字段
      if (data.caseType === 'PUBLIC_PROSECUTION') {
        if (!data.prosecutorIds || data.prosecutorIds.length === 0) {
          toast.error('公诉案件必须至少选择一位检察官');
          setLoading(false);
          return;
        }
        if (!data.defendantLawyerIds || data.defendantLawyerIds.length === 0) {
          toast.error('公诉案件必须至少选择一位被告律师');
          setLoading(false);
          return;
        }
      } else if (data.caseType === 'CIVIL_LITIGATION') {
        if (!data.plaintiffLawyerIds || data.plaintiffLawyerIds.length === 0) {
          toast.error('民事诉讼必须至少选择一位原告律师');
          setLoading(false);
          return;
        }
        if (!data.defendantLawyerIds || data.defendantLawyerIds.length === 0) {
          toast.error('民事诉讼必须至少选择一位被告律师');
          setLoading(false);
          return;
        }
      }

      const payload: CreateCaseDTO = {
        caseNumber: data.caseNumber,
        caseTitle: data.caseTitle,
        caseType: data.caseType,
        description: data.description,
        judgeIds: data.judgeIds || [],
      };

      // 根据案件类型设置不同的字段
      if (data.caseType === 'PUBLIC_PROSECUTION') {
        // 公诉案件：需要检察官和被告律师
        payload.prosecutorIds = data.prosecutorIds || [];
        payload.defendantLawyerIds = data.defendantLawyerIds || [];
      } else if (data.caseType === 'CIVIL_LITIGATION') {
        // 民事诉讼：需要原告律师和被告律师
        payload.plaintiffLawyerIds = data.plaintiffLawyerIds || [];
        payload.defendantLawyerIds = data.defendantLawyerIds || [];
      }

      await CaseApi.create(payload);
      toast.success('案件创建成功');
      router.push('/case/case-list');
    } catch (error: any) {
      // 更详细的错误提示
      const errorMessage = error.response?.data?.error || 
                          error.response?.data?.message || 
                          error.message || 
                          '创建失败';
      toast.error(typeof errorMessage === 'string' ? errorMessage : '创建失败，请检查表单数据');
      console.error('创建案件失败:', error);
      // 打印详细的错误信息便于调试
      if (error.response?.data) {
        console.error('错误详情:', error.response.data);
      }
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

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              案件类型 <span className="text-red-500">*</span>
            </label>
            <select
              {...register('caseType', { required: '案件类型是必填项' })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">请选择案件类型</option>
              <option value="PUBLIC_PROSECUTION">公诉</option>
              <option value="CIVIL_LITIGATION">民事诉讼</option>
            </select>
            {errors.caseType && (
              <p className="mt-1 text-sm text-red-600">{errors.caseType.message}</p>
            )}
          </div>

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
            
            {/* 法官选择 - 所有案件类型都需要 */}
            <div className="mb-6">
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
                    judges.map((user) => {
                      const userId = getUserId(user);
                      return (
                        <option key={userId} value={userId}>
                          {user.name} ({userId})
                        </option>
                      );
                    })
                  )}
                </select>
              )}
              {selectedJudgeIds.length > 0 && (
                <p className="text-xs text-gray-500 mt-1">
                  已选择 {selectedJudgeIds.length} 位法官
                </p>
              )}
            </div>

            {/* 根据案件类型显示不同的字段 */}
            {selectedCaseType === 'PUBLIC_PROSECUTION' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* 检察官选择 - 仅公诉案件 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    检察官 <span className="text-red-500">*</span>
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
                        prosecutors.map((user) => {
                          const userId = getUserId(user);
                          return (
                            <option key={userId} value={userId}>
                              {user.name} ({userId})
                            </option>
                          );
                        })
                      )}
                    </select>
                  )}
                  {selectedProsecutorIds.length > 0 && (
                    <p className="text-xs text-gray-500 mt-1">
                      已选择 {selectedProsecutorIds.length} 位检察官
                    </p>
                  )}
                </div>

                {/* 被告律师 - 公诉案件 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    被告律师 <span className="text-red-500">*</span>
                  </label>
                  {loadingUsers ? (
                    <div className="text-sm text-gray-500">加载中...</div>
                  ) : (
                    <select
                      multiple
                      size={5}
                      value={selectedDefendantLawyerIds}
                      onChange={(e) => handleMultiSelectChange('defendantLawyerIds', e)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                    >
                      {lawyers.length === 0 ? (
                        <option disabled>暂无律师</option>
                      ) : (
                        lawyers.map((user) => {
                          const userId = getUserId(user);
                          return (
                            <option key={userId} value={userId}>
                              {user.name} ({userId})
                            </option>
                          );
                        })
                      )}
                    </select>
                  )}
                  {selectedDefendantLawyerIds.length > 0 && (
                    <p className="text-xs text-gray-500 mt-1">
                      已选择 {selectedDefendantLawyerIds.length} 位被告律师
                    </p>
                  )}
                </div>
              </div>
            )}

            {selectedCaseType === 'CIVIL_LITIGATION' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* 原告律师 - 仅民事诉讼 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    原告律师 <span className="text-red-500">*</span>
                  </label>
                  {loadingUsers ? (
                    <div className="text-sm text-gray-500">加载中...</div>
                  ) : (
                    <select
                      multiple
                      size={5}
                      value={selectedPlaintiffLawyerIds}
                      onChange={(e) => handleMultiSelectChange('plaintiffLawyerIds', e)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                    >
                      {lawyers.length === 0 ? (
                        <option disabled>暂无律师</option>
                      ) : (
                        lawyers.map((user) => {
                          const userId = getUserId(user);
                          return (
                            <option key={userId} value={userId}>
                              {user.name} ({userId})
                            </option>
                          );
                        })
                      )}
                    </select>
                  )}
                  {selectedPlaintiffLawyerIds.length > 0 && (
                    <p className="text-xs text-gray-500 mt-1">
                      已选择 {selectedPlaintiffLawyerIds.length} 位原告律师
                    </p>
                  )}
                </div>

                {/* 被告律师 - 民事诉讼 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    被告律师 <span className="text-red-500">*</span>
                  </label>
                  {loadingUsers ? (
                    <div className="text-sm text-gray-500">加载中...</div>
                  ) : (
                    <select
                      multiple
                      size={5}
                      value={selectedDefendantLawyerIds}
                      onChange={(e) => handleMultiSelectChange('defendantLawyerIds', e)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                    >
                      {lawyers.length === 0 ? (
                        <option disabled>暂无律师</option>
                      ) : (
                        lawyers.map((user) => {
                          const userId = getUserId(user);
                          return (
                            <option key={userId} value={userId}>
                              {user.name} ({userId})
                            </option>
                          );
                        })
                      )}
                    </select>
                  )}
                  {selectedDefendantLawyerIds.length > 0 && (
                    <p className="text-xs text-gray-500 mt-1">
                      已选择 {selectedDefendantLawyerIds.length} 位被告律师
                    </p>
                  )}
                </div>
              </div>
            )}

            {!selectedCaseType && (
              <div className="text-sm text-gray-500 italic">
                请先选择案件类型以显示相应的人员选择字段
              </div>
            )}

            <p className="text-xs text-gray-500 mt-4">
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

