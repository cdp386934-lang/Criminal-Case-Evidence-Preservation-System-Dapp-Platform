'use client'

import { useEffect, useMemo, useState } from 'react'
import DashboardLayout from '../../components/layouts/dashboard-layout'
import toast from 'react-hot-toast'
import { CaseApi } from '../../api/case.api'

type CaseItem = {
  _id: string
  caseNumber: string
  caseTitle: string
  caseType?: string
  description?: string
  status?: string
}

export default function PoliceCaseDelete() {
  const [items, setItems] = useState<CaseItem[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  useEffect(() => {
    loadCases(page, pageSize)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, pageSize])

  const loadCases = async (pageNum: number, size: number) => {
    setLoading(true)
    try {
      const res = await CaseApi.list()
      const responseData = res.data
      // CaseApi.list() 返回 { success: boolean; data: Case[] }
      const list: CaseItem[] = responseData.data || []
      const totalCount = list.length
      setItems(list)
      setTotal(totalCount)
    } catch (error: any) {
      toast.error(error?.response?.data?.error || error?.response?.data?.message || '获取案件列表失败')
    } finally {
      setLoading(false)
    }
  }

  const filteredItems = useMemo(() => {
    if (!search.trim()) return items
    const keyword = search.toLowerCase()
    return items.filter((c) =>
      [c.caseNumber, c.caseTitle, c.caseType, c.description]
        .filter(Boolean)
        .some((field) => (field as string).toLowerCase().includes(keyword))
    )
  }, [items, search])

  const handleDelete = async (id: string) => {
    if (!confirm('确认删除该案件？')) return
    setDeletingId(id)
    try {
      await CaseApi.delete(id)
      toast.success('删除成功')
      loadCases(page, pageSize)
    } catch (error: any) {
      toast.error(error?.response?.data?.error || '删除失败（当前角色可能无权限）')
    } finally {
      setDeletingId(null)
    }
  }

  const totalPages = Math.max(1, Math.ceil(total / pageSize))

  return (
    <DashboardLayout>
      <div className="px-4 py-6 sm:px-0 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900">删除案件（公安）</h2>
          <div className="flex items-center space-x-2">
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="案件号/标题/类型/描述"
              className="input input-bordered input-sm w-64"
            />
            <select
              value={pageSize}
              onChange={(e) => setPageSize(Number(e.target.value))}
              className="select select-bordered select-sm"
            >
              {[10, 20, 50, 100].map((size) => (
                <option key={size} value={size}>
                  每页 {size}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="bg-white shadow sm:rounded-lg">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-semibold text-gray-500 uppercase">
                    案件号
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-semibold text-gray-500 uppercase">
                    标题
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-semibold text-gray-500 uppercase">
                    类型
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-semibold text-gray-500 uppercase">
                    状态
                  </th>
                  <th className="px-4 py-2 text-right text-xs font-semibold text-gray-500 uppercase">
                    操作
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {loading ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-6 text-center text-sm text-gray-500">
                      加载中...
                    </td>
                  </tr>
                ) : filteredItems.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-6 text-center text-sm text-gray-500">
                      暂无数据
                    </td>
                  </tr>
                ) : (
                  filteredItems.map((c) => (
                    <tr key={c._id}>
                      <td className="px-4 py-2 text-sm text-gray-900">{c.caseNumber}</td>
                      <td className="px-4 py-2 text-sm text-gray-700">{c.caseTitle}</td>
                      <td className="px-4 py-2 text-sm text-gray-700">{c.caseType}</td>
                      <td className="px-4 py-2 text-sm text-gray-700">{c.status}</td>
                      <td className="px-4 py-2 text-right">
                        <button
                          onClick={() => handleDelete(c._id)}
                          className="btn btn-error btn-xs"
                          disabled={deletingId === c._id}
                        >
                          {deletingId === c._id ? '删除中…' : '删除'}
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          <div className="flex items-center justify-between px-4 py-3 border-t border-gray-200">
            <div className="text-sm text-gray-600">
              共 {total} 条 | 第 {page} / {totalPages} 页
            </div>
            <div className="space-x-2">
              <button
                className="btn btn-sm"
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
              >
                上一页
              </button>
              <button
                className="btn btn-sm"
                disabled={page >= totalPages}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              >
                下一页
              </button>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}

