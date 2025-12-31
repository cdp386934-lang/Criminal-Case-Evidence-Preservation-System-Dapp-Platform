import { Correction, CreateCorrectionDTO, UpdateCorrectionDTO } from "../models/corrention.model";
import ApiClient from "./api-client";

export const CorrectionApi = {
  listByEvidence: (evidenceId: string) =>
    ApiClient.get<{ success: boolean; data: Correction[] }>(`/corrections/list/${evidenceId}`),
  
  getById: (id: string) =>
    ApiClient.get<{ success: boolean; data: Correction }>(`/corrections/get/${id}`),
  
  create: (data: CreateCorrectionDTO) =>
    ApiClient.post<{ success: boolean; data: Correction }>('/corrections/add', data),
  
  update: (id: string, data: UpdateCorrectionDTO) =>
    ApiClient.put<{ success: boolean; data: Correction }>(`/corrections/update/${id}`, data),
  
  delete: (id: string) =>
    ApiClient.delete(`/corrections/delete/${id}`),
};

