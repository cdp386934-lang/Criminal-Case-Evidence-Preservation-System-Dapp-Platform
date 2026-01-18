'use client'

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { EvidenceApi, ListEvidenceParams } from '../../api/evidence.api';
import { Evidence } from '../../models/evidence.model';
import { ObjectionApi } from '../../api/objection.api';
import { Objection } from '../../models/objection.model';
import { PaginatedResponse } from '../../api/case.api';
import { useAuthStore } from '../../../store/authStore';
import toast from 'react-hot-toast';

export default function EvidenceList() {
  const searchParams = useSearchParams();
  const caseId = searchParams.get('caseId');
  const { user } = useAuthStore();
  const [evidences, setEvidences] = useState<Evidence[]>([]);
  const [objectionsMap, setObjectionsMap] = useState<Record<string, Objection[]>>({});
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(20);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [keyword, setKeyword] = useState('');
  const [status, setStatus] = useState('');
  const [searchInput, setSearchInput] = useState('');

  useEffect(() => {
    if (caseId) {
      loadEvidences();
      loadObjections();
    }
  }, [caseId, page, status]);

  const loadEvidences = async () => {
    if (!caseId) return;
    try {
      setLoading(true);
      const params: ListEvidenceParams = { page, pageSize };
      if (keyword) params.keyword = keyword;
      if (status) params.status = status;
      
      const response = await EvidenceApi.listByCase(caseId, params);
      const data = response.data.data as PaginatedResponse<Evidence>;
      setEvidences(data.items || []);
      setTotal(data.total || 0);
      setTotalPages(data.totalPages || 0);
    } catch (error: any) {
      toast.error(error.response?.data?.message || '加载证据列表失败');
      console.error('Failed to load evidences:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    setKeyword(searchInput);
    setPage(1);
  };

  const handleReset = () => {
    setSearchInput('');
    setKeyword('');
    setStatus('');
    setPage(1);
  };

  const loadObjections = async () => {
    if (!caseId) return;
    try {
      // 获取所有质证意见（不分页，用于显示在每个证据下方）
      const response = await ObjectionApi.list({ caseId, pageSize: 1000 });
      const data = response.data.data as PaginatedResponse<Objection>;
      const objections = data?.items || [];
      
      // 按证据ID分组质证意见
      const map: Record<string, Objection[]> = {};
      objections.forEach((obj: Objection) => {
        const evidenceId = typeof obj.evidenceId === 'string' ? obj.evidenceId : obj.evidenceId._id;
        if (!map[evidenceId]) {
          map[evidenceId] = [];
        }
        map[evidenceId].push(obj);
      });
      setObjectionsMap(map);
    } catch (error: any) {
      // 静默失败，不影响证据列表显示
      console.error('Failed to load objections:', error);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">证据列表</h1>
        {caseId && (user?.role === 'police' || user?.role === 'prosecutor' || user?.role === 'lawyer') && (
          <Link
            href={`/evidence/add-evidence?caseId=${caseId}`}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            添加证据
          </Link>
        )}
      </div>

      {/* 搜索和筛选区域 */}
      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          {/* 关键词搜索 */}
          <div className="md:col-span-2">
            <input
              type="text"
              placeholder="搜索证据标题、描述或文件名..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          {/* 状态筛选 */}
          <div>
            <select
              value={status}
              onChange={(e) => {
                setStatus(e.target.value);
                setPage(1);
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">全部状态</option>
              <option value="pending">待查阅</option>
              <option value="approved">已批准</option>
              <option value="rejected">已拒绝</option>
              <option value="corrected">已补正</option>
            </select>
          </div>
        </div>

        {/* 操作按钮 */}
        <div className="flex gap-2">
          <button
            onClick={handleSearch}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            搜索
          </button>
          <button
            onClick={handleReset}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
          >
            重置
          </button>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-8">加载中...</div>
      ) : evidences.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg shadow">
          <p className="text-gray-500">暂无证据</p>
        </div>
      ) : (
        <div className="space-y-6">
          {evidences.map((evidence) => {
            const objections = objectionsMap[evidence._id] || [];
            const getStatusLabel = (status: string) => {
              switch (status) {
                case 'pending': return '待查阅';
                case 'approved': return '已批准';
                case 'rejected': return '已拒绝';
                case 'corrected': return '已补正';
                default: return status;
              }
            };
            const getStatusColor = (status: string) => {
              switch (status) {
                case 'pending': return 'bg-yellow-100 text-yellow-800';
                case 'approved': return 'bg-green-100 text-green-800';
                case 'rejected': return 'bg-red-100 text-red-800';
                case 'corrected': return 'bg-blue-100 text-blue-800';
                default: return 'bg-gray-100 text-gray-800';
              }
            };

            return (
              <div key={evidence._id} className="bg-white rounded-lg shadow p-6">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold mb-2">{evidence.title}</h3>
                    <p className="text-sm text-gray-600 mb-2">{evidence.description}</p>
                    <div className="flex items-center gap-2 mb-2">
                      <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(evidence.status)}`}>
                        {getStatusLabel(evidence.status)}
                      </span>
                      <span className="text-xs text-gray-500">{evidence.fileName}</span>
                    </div>
                  </div>
                  <Link
                    href={`/evidence/evidence-detail?id=${evidence._id}`}
                    className="text-blue-600 hover:text-blue-800 text-sm ml-4"
                  >
                    查看详情
                  </Link>
                </div>

                {/* 质证意见列表 */}
                {objections.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <h4 className="text-sm font-semibold text-gray-700 mb-3">质证意见 ({objections.length})</h4>
                    <div className="space-y-3">
                      {objections.map((obj) => {
                        const submitterName = typeof obj.lawyerId === 'string' 
                          ? '未知' 
                          : (obj.lawyerId.name || '未知');
                        const submitterRole = typeof obj.lawyerId === 'string'
                          ? ''
                          : (obj.lawyerId.role === 'lawyer' ? '律师' : obj.lawyerId.role === 'prosecutor' ? '检察官' : '');
                        
                        return (
                          <div key={obj._id} className="bg-gray-50 rounded-md p-3 text-sm">
                            <div className="flex justify-between items-start mb-2">
                              <div>
                                <span className="font-medium text-gray-900">{submitterName}</span>
                                {submitterRole && (
                                  <span className="ml-2 text-xs text-gray-500">({submitterRole})</span>
                                )}
                              </div>
                              <span className={`px-2 py-1 text-xs rounded ${
                                obj.status === 'accepted' ? 'bg-green-100 text-green-800' :
                                obj.status === 'rejected' ? 'bg-red-100 text-red-800' :
                                'bg-yellow-100 text-yellow-800'
                              }`}>
                                {obj.status === 'accepted' ? '已采纳' : obj.status === 'rejected' ? '已拒绝' : '待处理'}
                              </span>
                            </div>
                            <p className="text-gray-700 whitespace-pre-wrap">{obj.content}</p>
                            <p className="text-xs text-gray-500 mt-2">
                              {new Date(obj.createdAt).toLocaleString('zh-CN')}
                            </p>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* 如果是在起诉阶段且用户有权限，显示提交质证意见的链接 */}
                {caseId && (user?.role === 'lawyer' || user?.role === 'prosecutor') && (
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <Link
                      href={`/objection/add-objection?caseId=${caseId}&evidenceId=${evidence._id}`}
                      className="text-sm text-blue-600 hover:text-blue-800"
                    >
                      + 提交质证意见
                    </Link>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* 分页控件 */}
      {total > 0 && (
        <div className="mt-6 flex justify-between items-center bg-white rounded-lg shadow p-4">
          <div className="text-sm text-gray-700">
            共 {total} 条记录，第 {page} / {totalPages} 页
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-4 py-2 border rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              上一页
            </button>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
              className="px-4 py-2 border rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              下一页
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

