import { CreateEvidenceDTO, Evidence, UpdateEvidenceDTO } from '../models/evidence.model';
import ApiClient from './api-client';

export const EvidenceApi = {
  listByCase: (caseId: string) =>
    ApiClient.get<{ success: boolean; data: Evidence[] }>(`/evidence/list/${caseId}`),
  
  getById: (id: string) =>
    ApiClient.get<{ success: boolean; data: Evidence }>(`/evidence/get/${id}`),
  
  create: (data: CreateEvidenceDTO) =>
    ApiClient.post<{ success: boolean; data: Evidence }>('/evidence/add', data),
  
  update: (id: string, data: UpdateEvidenceDTO) =>
    ApiClient.put<{ success: boolean; data: Evidence }>(`/evidence/update/${id}`, data),
  
  delete: (id: string) =>
    ApiClient.delete(`/evidence/delete/${id}`),
};

