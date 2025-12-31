import { useEffect, useState } from 'react';
import { CaseTimeline } from '../../types/models';
import { caseApi } from '../api/case.api';
import { format } from 'date-fns';

interface TimelineViewerProps {
  caseId: string;
}

const STATUS_LABELS: Record<string, string> = {
  FILED: '公安立案',
  INVESTIGATION: '侦查中',
  TRANSFER_TO_PROCURATORATE: '移送审查起诉',
  PROCURATORATE_REVIEW: '检察院审查',
  PROSECUTION: '检察院起诉',
  COURT_TRIAL: '法院审理',
  JUDGEMENT: '判决完成',
  CLOSED: '结案',
};

const ROLE_LABELS: Record<string, string> = {
  police: '公安',
  prosecutor: '检察官',
  judge: '法官',
  lawyer: '律师',
};

export default function TimelineViewer({ caseId }: TimelineViewerProps) {
  const [timeline, setTimeline] = useState<CaseTimeline[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTimeline();
  }, [caseId]);

  const loadTimeline = async () => {
    try {
      setLoading(true);
      const response = await caseApi.getTimeline(caseId);
      setTimeline(response.data.data || []);
    } catch (error) {
      console.error('Failed to load timeline:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="text-center py-8">加载中...</div>;
  }

  if (timeline.length === 0) {
    return <div className="text-center py-8 text-gray-500">暂无时间线记录</div>;
  }

  return (
    <div className="w-full">
      <h3 className="text-lg font-semibold mb-4">案件时间线</h3>
      <div className="relative">
        {/* 时间线 */}
        <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-300" />

        {/* 时间线项目 */}
        <div className="space-y-6">
          {timeline.map((item, index) => (
            <div key={item._id} className="relative flex items-start">
              {/* 时间线节点 */}
              <div className="absolute left-2 w-4 h-4 rounded-full bg-blue-600 border-2 border-white z-10" />

              {/* 内容 */}
              <div className="ml-8 flex-1">
                <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded">
                        {STATUS_LABELS[item.stage] || item.stage}
                      </span>
                      <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                        {ROLE_LABELS[item.operatorRole] || item.operatorRole}
                      </span>
                    </div>
                    <span className="text-xs text-gray-500">
                      {format(new Date(item.timestamp), 'yyyy-MM-dd HH:mm:ss')}
                    </span>
                  </div>

                  {item.comment && (
                    <div className="mt-2 text-sm text-gray-600">{item.comment}</div>
                  )}

                  {item.operatorAddress && (
                    <div className="mt-2 text-xs text-gray-500">
                      钱包地址: <span className="font-mono">{item.operatorAddress}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

