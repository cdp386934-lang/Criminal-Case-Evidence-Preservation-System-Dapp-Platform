import { CreateObjectionDTO, HandleObjectionDTO, Objection, ObjectionStatus } from '../models/objection.model';
import ApiClient from './api-client';


export const ObjectionApi = {
  list: (params?: { caseId?: string; evidenceId?: string; status?: ObjectionStatus }) => {
    const queryParams = new URLSearchParams();
    if (params?.caseId) queryParams.append('caseId', params.caseId);
    if (params?.evidenceId) queryParams.append('evidenceId', params.evidenceId);
    if (params?.status) queryParams.append('status', params.status);
    const query = queryParams.toString();
    return ApiClient.get<{ success: boolean; data: Objection[] }>(
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

