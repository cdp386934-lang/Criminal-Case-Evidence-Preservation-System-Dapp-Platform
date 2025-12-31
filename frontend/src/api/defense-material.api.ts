import { CreateMaterialDTO, DefenseMaterial, UpdateMaterialDTO } from "../models/defense-material.model";
import ApiClient from "./api-client";

export const DefenseMaterialApi = {
  listByCase: (caseId: string) =>
    ApiClient.get<{ success: boolean; data: DefenseMaterial[] }>(`/defense-materials/list/${caseId}`),
  
  getById: (id: string) =>
    ApiClient.get<{ success: boolean; data: DefenseMaterial }>(`/defense-materials/get/${id}`),
  
  create: (data: CreateMaterialDTO) =>
    ApiClient.post<{ success: boolean; data: DefenseMaterial }>('/defense-materials/add', data),
  
  update: (id: string, data: UpdateMaterialDTO) =>
    ApiClient.put<{ success: boolean; data: DefenseMaterial }>(`/defense-materials/update/${id}`, data),
  
  delete: (id: string) =>
    ApiClient.delete(`/defense-materials/delete/${id}`),
};

