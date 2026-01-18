'use client'

import { CaseApi, PaginatedResponse } from '../../api/case.api';
import { Case } from '../../models/case.model';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuthStore } from '../../../store/authStore';
import toast from 'react-hot-toast';

export default function CaseList() {
  const [cases, setCases] = useState<Case[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(20);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [keyword, setKeyword] = useState('');
  const [status, setStatus] = useState('');
  const [caseType, setCaseType] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const { user } = useAuthStore();

  useEffect(() => {
    loadCases();
  }, [page, status, caseType]);

  const loadCases = async () => {
    try {
      setLoading(true);
      const response = await CaseApi.list({ page, pageSize, keyword, status, caseType });
      const data = response.data.data as PaginatedResponse<Case>;
      setCases(data.items || []);
      setTotal(data.total || 0);
      setTotalPages(data.totalPages || 0);
    } catch (error: any) {
      toast.error(error.response?.data?.message || '加载案件列表失败');
      console.error('Failed to load cases:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    setKeyword(searchInput);
    setPage(1); // 搜索时重置到第一页
  };

  const handleReset = () => {
    setSearchInput('');
    setKeyword('');
    setStatus('');
    setCaseType('');
    setPage(1);
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

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">案件列表</h1>
        {user?.role === 'police' && (
          <Link
            href="/case/create-case"
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            创建案件
          </Link>
        )}
      </div>

      {/* 搜索和筛选区域 */}
      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
          {/* 关键词搜索 */}
          <div className="md:col-span-2">
            <input
              type="text"
              placeholder="搜索案件编号或标题..."
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
              <option value="INVESTIGATION">侦查中</option>
              <option value="PROCURATORATE">检察院审查</option>
              <option value="COURT_TRIAL">法院审理</option>
              <option value="CLOSED">结案</option>
            </select>
          </div>

          {/* 案件类型筛选 */}
          <div>
            <select
              value={caseType}
              onChange={(e) => {
                setCaseType(e.target.value);
                setPage(1);
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">全部类型</option>
              <option value="PUBLIC_PROSECUTION">公诉</option>
              <option value="CIVIL_LITIGATION">民事诉讼</option>
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
      ) : cases.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg shadow">
          <p className="text-gray-500">暂无案件</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  案件编号
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  案件标题
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  案件类型
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  状态
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  操作
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {cases.map((caseItem) => (
                <tr key={caseItem._id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {caseItem.caseNumber}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {caseItem.caseTitle}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {caseItem.caseType}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded">
                      {getStatusLabel(caseItem.status)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <Link
                      href={`/case/case-detail?id=${caseItem._id}`}
                      className="text-blue-600 hover:text-blue-900 mr-4"
                    >
                      查看
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
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

