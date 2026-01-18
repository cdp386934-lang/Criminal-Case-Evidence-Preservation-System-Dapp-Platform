import { CreateObjectionDTO, HandleObjectionDTO, Objection, ObjectionStatus } from '../models/objection.model';
import ApiClient from './api-client';
import { PaginatedResponse } from './case.api';

export interface ListObjectionsParams {
  caseId?: string;
  evidenceId?: string;
  status?: ObjectionStatus;
  keyword?: string;
  page?: number;
  pageSize?: number;
}

export const ObjectionApi = {
  list: (params?: ListObjectionsParams) => {
    const queryParams = new URLSearchParams();
    if (params?.caseId) queryParams.append('caseId', params.caseId);
    if (params?.evidenceId) queryParams.append('evidenceId', params.evidenceId);
    if (params?.status) queryParams.append('status', params.status);
    if (params?.keyword) queryParams.append('keyword', params.keyword);
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.pageSize) queryParams.append('pageSize', params.pageSize.toString());
    const query = queryParams.toString();
    return ApiClient.get<{ success: boolean; data: PaginatedResponse<Objection> }>(
      `/objections${query ? `?${query}` : ''}`
    );
  },

  getById: (id: string) =>
    ApiClient.get<{ success: boolean; data: Objection }>(`/objections/${id}`),

  create: (data: CreateObjectionDTO) =>
    ApiClient.post<{ success: boolean; data: Objection }>('/objections', data),

  handle: (id: string, data: HandleObjectionDTO) =>
    ApiClient.post<{ success: boolean; data: Objection }>(`/objections/${id}/handle`, data),
};

