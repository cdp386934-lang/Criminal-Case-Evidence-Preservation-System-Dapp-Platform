import { Case, CreateCaseDTO, MoveNextStageDTO, UpdateCaseDTO } from "../models/case.model";
import ApiClient from "./api-client";

export const CaseApi = {
  /** 当前用户案件列表 */
  list: () =>
    ApiClient.get<{ success: boolean; data: Case[] }>('/cases'),

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
