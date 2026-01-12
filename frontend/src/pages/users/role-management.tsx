'use client'

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { UserApi } from '../../api/user-api';
import { RoleAssignment, UserRole, ListRolesParams } from '../../models/user.model';
import { useAuthStore } from '../../../store/authStore';
import toast from 'react-hot-toast';

export default function RoleManagement() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [roles, setRoles] = useState<RoleAssignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [total, setTotal] = useState(0);
  const [filters, setFilters] = useState<ListRolesParams>({});
  const [showGrantModal, setShowGrantModal] = useState(false);
  const [grantForm, setGrantForm] = useState({ role: 'judge' as UserRole, address: '' });

  useEffect(() => {
    // 检查是否为管理员
    if (user?.role !== 'admin') {
      toast.error('无权限访问');
      router.push('/dashboard');
      return;
    }
    loadRoles();
  }, [page, pageSize, filters, user,  router.push]);

  const loadRoles = async () => {
    try {
      setLoading(true);
      const params: ListRolesParams = {
        page,
        pageSize,
        ...filters,
      };
      const response = await UserApi.listRoles(params);
      setRoles(response.data.list || []);
      setTotal(response.data.total || 0);
    } catch (error: any) {
      toast.error(error.response?.data?.error || '加载角色列表失败');
    } finally {
      setLoading(false);
    }
  };

  const handleGrantRole = async () => {
    if (!grantForm.address) {
      toast.error('请输入钱包地址');
      return;
    }

    try {
      let response;
      switch (grantForm.role) {
        case 'judge':
          response = await UserApi.grantJudge({ address: grantForm.address });
          break;
        case 'prosecutor':
          response = await UserApi.grantProsecutor({ address: grantForm.address });
          break;
        case 'lawyer':
          response = await UserApi.grantLawyer({ address: grantForm.address });
          break;
        case 'police':
          response = await UserApi.grantPolice({ address: grantForm.address });
          break;
        default:
          toast.error('无效的角色');
          return;
      }
      toast.success('角色授权成功');
      setShowGrantModal(false);
      setGrantForm({ role: 'judge', address: '' });
      loadRoles();
    } catch (error: any) {
      toast.error(error.response?.data?.error || '角色授权失败');
    }
  };

  const handleRevokeRole = async (id: string) => {
    if (!confirm('确定要撤销此角色吗？')) return;

    try {
      await UserApi.revokeRole(id);
      toast.success('角色撤销成功');
      loadRoles();
    } catch (error: any) {
      toast.error(error.response?.data?.error || '角色撤销失败');
    }
  };

  const handleUpdateRole = async (id: string, newRole: UserRole) => {
    if (!confirm('确定要更新此角色吗？')) return;

    try {
      await UserApi.updateRole(id, { newRole });
      toast.success('角色更新成功');
      loadRoles();
    } catch (error: any) {
      toast.error(error.response?.data?.error || '角色更新失败');
    }
  };

  const getRoleLabel = (role: UserRole) => {
    const labels: Record<UserRole, string> = {
      police: '公安机关',
      judge: '法官',
      prosecutor: '检察官',
      lawyer: '律师',
      admin: '管理员',
    };
    return labels[role] || role;
  };

  if (loading && roles.length === 0) {
    return <div className="text-center py-8">加载中...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">角色管理</h1>
        <button
          onClick={() => setShowGrantModal(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          授权角色
        </button>
      </div>

      {/* 筛选器 */}
      <div className="bg-white p-4 rounded-lg shadow mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              角色
            </label>
            <select
              value={filters.role || ''}
              onChange={(e) =>
                setFilters({
                  ...filters,
                  role: e.target.value as UserRole || undefined,
                })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            >
              <option value="">全部</option>
              {(['police', 'judge', 'prosecutor', 'lawyer'] as UserRole[]).map((role) => (
                <option key={role} value={role}>
                  {getRoleLabel(role)}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              状态
            </label>
            <select
              value={filters.status || ''}
              onChange={(e) =>
                setFilters({
                  ...filters,
                  status: e.target.value as 'active' | 'revoked' || undefined,
                })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            >
              <option value="">全部</option>
              <option value="active">激活</option>
              <option value="revoked">已撤销</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              钱包地址
            </label>
            <input
              type="text"
              value={filters.address || ''}
              onChange={(e) =>
                setFilters({ ...filters, address: e.target.value || undefined })
              }
              placeholder="搜索钱包地址"
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            />
          </div>
        </div>
      </div>

      {/* 角色列表 */}
      {roles.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg shadow">
          <p className="text-gray-500">暂无角色分配</p>
        </div>
      ) : (
        <>
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    钱包地址
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    角色
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    状态
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    交易哈希
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    创建时间
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    操作
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {roles.map((role) => (
                  <tr key={role._id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {role.address}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded">
                        {getRoleLabel(role.role)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <span
                        className={`px-2 py-1 text-xs font-medium rounded ${
                          role.status === 'active'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {role.status === 'active' ? '激活' : '已撤销'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-mono">
                      {role.txHash.substring(0, 20)}...
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(role.createdAt).toLocaleString('zh-CN')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      {role.status === 'active' && (
                        <>
                          <button
                            onClick={() => handleRevokeRole(role._id)}
                            className="text-red-600 hover:text-red-900 mr-4"
                          >
                            撤销
                          </button>
                          <select
                            onChange={(e) =>
                              handleUpdateRole(role._id, e.target.value as UserRole)
                            }
                            className="text-sm border rounded px-2 py-1"
                            defaultValue=""
                          >
                            <option value="" disabled>
                              更新角色
                            </option>
                            {(['police', 'judge', 'prosecutor', 'lawyer'] as UserRole[])
                              .filter((r) => r !== role.role)
                              .map((r) => (
                                <option key={r} value={r}>
                                  更新为{getRoleLabel(r)}
                                </option>
                              ))}
                          </select>
                        </>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* 分页 */}
          <div className="mt-4 flex justify-between items-center">
            <div className="text-sm text-gray-700">
              共 {total} 条，第 {page} / {Math.ceil(total / pageSize)} 页
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-4 py-2 border rounded disabled:opacity-50"
              >
                上一页
              </button>
              <button
                onClick={() => setPage((p) => p + 1)}
                disabled={page >= Math.ceil(total / pageSize)}
                className="px-4 py-2 border rounded disabled:opacity-50"
              >
                下一页
              </button>
            </div>
          </div>
        </>
      )}

      {/* 授权角色模态框 */}
      {showGrantModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">授权角色</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  角色
                </label>
                <select
                  value={grantForm.role}
                  onChange={(e) =>
                    setGrantForm({ ...grantForm, role: e.target.value as UserRole })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                >
                  <option value="judge">法官</option>
                  <option value="prosecutor">检察官</option>
                  <option value="lawyer">律师</option>
                  <option value="police">公安机关</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  钱包地址
                </label>
                <input
                  type="text"
                  value={grantForm.address}
                  onChange={(e) =>
                    setGrantForm({ ...grantForm, address: e.target.value })
                  }
                  placeholder="输入钱包地址"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>
            </div>
            <div className="mt-6 flex justify-end gap-2">
              <button
                onClick={() => setShowGrantModal(false)}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
              >
                取消
              </button>
              <button
                onClick={handleGrantRole}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                确认
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

