import { Case, CreateCaseDTO, MoveNextStageDTO, UpdateCaseDTO } from "../models/case.model";
import ApiClient from "./api-client";

// 通用分页响应类型
export interface PaginatedResponse<T> {
  items: T[];
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

export interface ListCasesParams {
  page?: number;
  pageSize?: number;
  keyword?: string;
  status?: string;
  caseType?: string;
}

export const CaseApi = {
  /** 当前用户案件列表（支持分页和搜索） */
  list: (params?: ListCasesParams) => {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.pageSize) queryParams.append('pageSize', params.pageSize.toString());
    if (params?.keyword) queryParams.append('keyword', params.keyword);
    if (params?.status) queryParams.append('status', params.status);
    if (params?.caseType) queryParams.append('caseType', params.caseType);
    const query = queryParams.toString();
    return ApiClient.get<{ success: boolean; data: PaginatedResponse<Case> }>(
      `/cases${query ? `?${query}` : ''}`
    );
  },

  /** 获取案件详情 */
  getById: (id: string) =>
    ApiClient.get<{ success: boolean; data: Case }>(`/cases/${id}`),

  /** 创建案件（仅公安） */
  create: (data: CreateCaseDTO) =>
    ApiClient.post<{ success: boolean; data: Case }>('/cases', data),

  /** 更新案件 */
  update: (id: string, data: UpdateCaseDTO) =>
    ApiClient.put<{ success: boolean; data: Case }>(`/cases/${id}`, data),

  /** 删除案件 */
  delete: (id: string) =>
    ApiClient.delete<{ success: boolean }>(`/cases/${id}`),

  /** 推进案件状态 */
  moveNextStage: (id: string, data: MoveNextStageDTO) =>
    ApiClient.post<{
      success: boolean;
      data: Case;
    }>(`/cases/${id}/status`, data),

  /** 获取案件时间线 */
  getTimeline: (id: string) =>
    ApiClient.get<{ success: boolean; data: any[] }>(
      `/cases/${id}/timeline`
    ),
};
