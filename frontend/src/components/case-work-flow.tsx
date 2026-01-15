import { useState, useEffect } from 'react';
import { CaseStatus } from '../models/case.model';
import {UserRole} from '../models/user.model'
import { CaseApi } from '../api/case.api';
import { useAuthStore } from '../../store/authStore';
import toast from 'react-hot-toast';

interface CaseWorkflowProps {
  caseId: string;
  currentStatus: CaseStatus;
  onStatusChange?: () => void;
}

const STATUS_LABELS: Record<CaseStatus, string> = {
  INVESTIGATION: '侦查中',
  PROCURATORATE: '检察院起诉',
  COURT_TRIAL: '法院审理',
  CLOSED: '结案',
};

const STATUS_ORDER: CaseStatus[] = [
  'INVESTIGATION',
  'PROCURATORATE',
  'COURT_TRIAL',
  'CLOSED',
];

// 角色可以推进的状态映射
const ROLE_PERMISSIONS: Record<UserRole, CaseStatus[]> = {
  police: ['INVESTIGATION'],
  prosecutor: [ 'PROCURATORATE'],
  judge: ['COURT_TRIAL', 'CLOSED'],
  lawyer: [],
  admin:[], // 管理员没有权限推进案件状态
};

export default function CaseWorkflow({ caseId, currentStatus, onStatusChange }: CaseWorkflowProps) {
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [canAdvance, setCanAdvance] = useState(false);

  useEffect(() => {
    if (user) {
      const allowedStatuses = ROLE_PERMISSIONS[user.role] || [];
      const currentIndex = STATUS_ORDER.indexOf(currentStatus);
      const nextStatus = STATUS_ORDER[currentIndex + 1] as CaseStatus | undefined;
      // 检查下一个状态是否在当前角色允许的状态列表中
      setCanAdvance(!!(nextStatus && allowedStatuses.includes(nextStatus)));
    } else {
      setCanAdvance(false);
    }
  }, [user, currentStatus]);

  const handleAdvance = async () => {
    if (!user) return;

    try {
      setLoading(true);
      await CaseApi.moveNextStage(caseId, {
        comment: `由${user.name}推进到下一阶段`,
        operatorAddress: user.walletAddress,
      });
      toast.success('案件状态已更新');
      onStatusChange?.();
    } catch (error: any) {
      toast.error(error.response?.data?.message || '操作失败');
    } finally {
      setLoading(false);
    }
  };

  const currentIndex = STATUS_ORDER.indexOf(currentStatus);

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">案件流程</h3>
        {canAdvance && user?.role !== 'lawyer' && (
          <button
            onClick={handleAdvance}
            disabled={loading}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? '处理中...' : '推进到下一阶段'}
          </button>
        )}
      </div>

      <div className="relative">
        {/* 连接线 */}
        <div className="absolute top-8 left-0 right-0 h-0.5 bg-gray-300" />

        {/* 步骤节点 */}
        <div className="relative flex justify-between">
          {STATUS_ORDER.map((status, index) => {
            const isActive = index <= currentIndex;
            const isCurrent = status === currentStatus;

            return (
              <div key={status} className="flex flex-col items-center flex-1">
                <div
                  className={`w-16 h-16 rounded-full flex items-center justify-center text-xs font-medium z-10 ${
                    isCurrent
                      ? 'bg-blue-600 text-white ring-4 ring-blue-200'
                      : isActive
                      ? 'bg-green-500 text-white'
                      : 'bg-gray-300 text-gray-600'
                  }`}
                >
                  {index + 1}
                </div>
                <div className="mt-2 text-center">
                  <div className={`text-sm font-medium ${isCurrent ? 'text-blue-600' : isActive ? 'text-green-600' : 'text-gray-500'}`}>
                    {STATUS_LABELS[status]}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 当前状态说明 */}
      <div className="mt-6 p-4 bg-blue-50 rounded-lg">
        <div className="text-sm text-gray-600">
          <span className="font-medium">当前状态：</span>
          <span className="text-blue-600 font-semibold">{STATUS_LABELS[currentStatus]}</span>
        </div>
        {user?.role === 'lawyer' && (
          <div className="mt-2 text-xs text-gray-500">律师角色仅可查看，无法操作</div>
        )}
      </div>
    </div>
  );
}

