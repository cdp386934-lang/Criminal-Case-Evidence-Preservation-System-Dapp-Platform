import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';;
import toast from 'react-hot-toast';
import { Case } from '@/src/models/case.model';
import { CaseApi } from '@/src/api/case.api';
import RoleGuard from '@/src/components/role-guard';
import CaseWorkflow from '@/src/components/case-work-flow';
import TimelineViewer from '@/src/components/timeline-viewer';

export default function CaseDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [caseData, setCaseData] = useState<Case | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      loadCase();
    }
  }, [id]);

  const loadCase = async () => {
    if (!id) return;
    try {
      setLoading(true);
      const response = await CaseApi.getById(id);
      setCaseData(response.data.data);
    } catch (error: any) {
      toast.error(error.response?.data?.message || '加载失败');
      navigate('/cases');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = () => {
    loadCase();
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      INVESTIGATION: '侦查中',
      PROCURATORATE: '检察院审查',
      COURT_TRIAL: '法院审理',
      CLOSED: '结案',
    };
    return labels[status] || status;
  };

  if (loading) {
    return <div className="text-center py-8">加载中...</div>;
  }

  if (!caseData) {
    return <div className="text-center py-8">案件不存在</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6 flex justify-between items-center">
        <h1 className="text-2xl font-bold">案件详情</h1>
        <div className="space-x-2">
          <RoleGuard allow={['judge']}>
            <Link
              to={`/cases/${id}/edit`}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              编辑
            </Link>
          </RoleGuard>
          <Link
            to={`/cases/${id}/workflow`}
            className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700"
          >
            流程管理
          </Link>
          <Link
            to="/cases"
            className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
          >
            返回列表
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">基本信息</h2>
          <div className="space-y-3">
            <div>
              <span className="text-gray-600">案件编号：</span>
              <span className="font-medium">{caseData.caseNumber}</span>
            </div>
            <div>
              <span className="text-gray-600">案件标题：</span>
              <span className="font-medium">{caseData.caseTitle}</span>
            </div>
            <div>
              <span className="text-gray-600">案件类型：</span>
              <span className="font-medium">{caseData.caseType}</span>
            </div>
            <div>
              <span className="text-gray-600">状态：</span>
              <span className="px-2 py-1 bg-blue-100 text-blue-800 text-sm font-medium rounded">
                {getStatusLabel(caseData.status)}
              </span>
            </div>
            {caseData.description && (
              <div>
                <span className="text-gray-600">描述：</span>
                <p className="mt-1">{caseData.description}</p>
              </div>
            )}
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">案件流程</h2>
          <CaseWorkflow
            caseId={caseData._id}
            currentStatus={caseData.status}
            onStatusChange={handleStatusChange}
          />
        </div>
      </div>

      <div className="mt-6 bg-white p-6 rounded-lg shadow">
        <TimelineViewer caseId={caseData._id} />
      </div>

      <div className="mt-6 bg-white p-6 rounded-lg shadow">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">相关资源</h2>
          <div className="space-x-2">
            <Link
              to={`/cases/${id}/evidence`}
              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
            >
              查看证据
            </Link>
            <RoleGuard allow={['lawyer']}>
              <Link
                to={`/cases/${id}/materials`}
                className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700"
              >
                查看辩护材料
              </Link>
            </RoleGuard>
          </div>
        </div>
      </div>
    </div>
  );
}

