import { CreateEvidenceDTO, Evidence, UpdateEvidenceDTO } from '../models/evidence.model';
import ApiClient from './api-client';
import { PaginatedResponse } from './case.api';

export interface VerifyEvidenceDTO {
  status: 'approved' | 'rejected';
  reason?: string;
}

export interface ListEvidenceParams {
  page?: number;
  pageSize?: number;
  keyword?: string;
  status?: string;
  evidenceType?: string;
}

export const EvidenceApi = {
  listByCase: (caseId: string, params?: ListEvidenceParams) => {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.pageSize) queryParams.append('pageSize', params.pageSize.toString());
    if (params?.keyword) queryParams.append('keyword', params.keyword);
    if (params?.status) queryParams.append('status', params.status);
    if (params?.evidenceType) queryParams.append('evidenceType', params.evidenceType);
    const query = queryParams.toString();
    return ApiClient.get<{ success: boolean; data: PaginatedResponse<Evidence> }>(
      `/evidence/list/${caseId}${query ? `?${query}` : ''}`
    );
  },
  
  getById: (id: string) =>
    ApiClient.get<{ success: boolean; data: Evidence }>(`/evidence/get/${id}`),
  
  create: (data: CreateEvidenceDTO) =>
    ApiClient.post<{ success: boolean; data: Evidence }>('/evidence/add', data),
  
  update: (id: string, data: UpdateEvidenceDTO) =>
    ApiClient.put<{ success: boolean; data: Evidence }>(`/evidence/update/${id}`, data),
  
  delete: (id: string) =>
    ApiClient.delete(`/evidence/delete/${id}`),
  
  // 警察验证律师上传的证据
  verify: (id: string, data: VerifyEvidenceDTO) =>
    ApiClient.put<{ success: boolean; data: Evidence }>(`/evidence/verify/${id}`, data),
};

