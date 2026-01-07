import ApiClient from "./api-client";

/**
 * 导出API
 */
export const ExportApi = {
  /** 导出案件证据清单PDF */
  exportEvidenceList: (caseId: string) =>
    ApiClient.get(`/export/cases/${caseId}/evidence-list`, {
      responseType: 'blob',
    }),

  /** 导出质证记录PDF */
  exportObjections: (caseId: string) =>
    ApiClient.get(`/export/cases/${caseId}/objections`, {
      responseType: 'blob',
    }),
};

