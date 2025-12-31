import { ListOperationLogsParams, OperationLogDTO } from "../models/operation-logs.model";
import ApiClient from "./api-client";

/* =========================
 * API
 * ========================= */

/** 管理员：操作日志列表 */

const listOperationLogs = (params?: ListOperationLogsParams) =>
  ApiClient.get<{
    items: OperationLogDTO[];
    page: number;
    pageSize: number;
    total: number;
  }>('/operation-logs/admin/list', { params });

/** 管理员：查看单条日志 */
const getOperationLog = (id: string) =>
  ApiClient.get<OperationLogDTO>(`/operation-logs/admin/${id}`);

export const OperationLogsApi = {
  listOperationLogs,
  getOperationLog
}