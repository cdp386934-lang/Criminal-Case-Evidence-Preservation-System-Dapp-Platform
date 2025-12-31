import { Case, CreateCaseDTO, MoveNextStageDTO, UpdateCaseDTO } from "../models/case.model";
import ApiClient from "./api-client";


export const CaseApi = {
  list: () =>
    ApiClient.get<{
      total: number;
      items: never[]; success: boolean; data: Case[] 
}>('/cases/list'),
  
  getById: (id: string) =>
    ApiClient.get<{ success: boolean; data: Case }>(`/cases/get/${id}`),
  
  create: (data: CreateCaseDTO) =>
    ApiClient.post<{ success: boolean; data: Case }>('/cases/add', data),
  
  update: (id: string, data: UpdateCaseDTO) =>
    ApiClient.put<{ success: boolean; data: Case }>(`/cases/update/${id}`, data),
  
  delete: (id: string) =>
    ApiClient.delete(`/cases/delete/${id}`),
  
  moveNextStage: (id: string, data: MoveNextStageDTO) =>
    ApiClient.post<{ success: boolean; data: { case: Case; timeline: any; message: string } }>(
      `/cases/move-next-stage/${id}`,
      data
    ),
  
  getTimeline: (id: string) =>
    ApiClient.get<{ success: boolean; data: any[] }>(`/cases/timeline/${id}`),
};

