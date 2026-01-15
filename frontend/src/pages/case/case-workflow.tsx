'use client'

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { CaseApi } from '../../api/case.api';
import { Case } from '../../models/case.model';
import CaseWorkflow from '../../components/case-work-flow';
import TimelineViewer from '../../components/timeline-viewer';

export default function CaseWorkflowPage() {
  const searchParams = useSearchParams();
  const id = searchParams.get('id');
  const router = useRouter();
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
    } catch (error) {
      console.error('Failed to load case:', error);
      router.push('/case/case-list');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = () => {
    loadCase();
  };

  if (loading) {
    return <div className="text-center py-8">加载中...</div>;
  }

  if (!caseData) {
    return <div className="text-center py-8">案件不存在</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <button
          onClick={() => router.push(`/case/case-detail?id=${id}`)}
          className="text-blue-600 hover:text-blue-800 mb-4"
        >
          ← 返回案件详情
        </button>
        <h1 className="text-2xl font-bold">案件流程管理</h1>
      </div>

      <div className="bg-white p-6 rounded-lg shadow mb-6">
        <CaseWorkflow
          caseId={caseData._id}
          currentStatus={caseData.status}
          onStatusChange={handleStatusChange}
        />
      </div>

      <div className="bg-white p-6 rounded-lg shadow">
        <TimelineViewer caseId={caseData._id} />
      </div>
    </div>
  );
}

