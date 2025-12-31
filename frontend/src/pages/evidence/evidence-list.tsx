import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { EvidenceApi } from '@/src/api/evidence.api';
import { Evidence } from '@/src/models/evidence.model';

export default function EvidenceList() {
  const { caseId } = useParams<{ caseId: string }>();
  const [evidences, setEvidences] = useState<Evidence[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (caseId) {
      loadEvidences();
    }
  }, [caseId]);

  const loadEvidences = async () => {
    if (!caseId) return;
    try {
      setLoading(true);
      const response = await EvidenceApi.listByCase(caseId);
      setEvidences(response.data.data || []);
    } catch (error) {
      console.error('Failed to load evidences:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="text-center py-8">加载中...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">证据列表</h1>
        {caseId && (
          <Link
            to={`/cases/${caseId}/evidence/create`}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            添加证据
          </Link>
        )}
      </div>

      {evidences.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg shadow">
          <p className="text-gray-500">暂无证据</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {evidences.map((evidence) => (
            <div key={evidence._id} className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold mb-2">{evidence.title}</h3>
              <p className="text-sm text-gray-600 mb-2">{evidence.description}</p>
              <div className="mt-4 flex justify-between items-center">
                <span className="text-xs text-gray-500">{evidence.fileName}</span>
                <Link
                  to={`/evidence/${evidence._id}`}
                  className="text-blue-600 hover:text-blue-800 text-sm"
                >
                  查看详情
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

