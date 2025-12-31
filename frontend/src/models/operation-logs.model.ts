export enum OperationType {
    EVIDENCE_UPLOAD = 'evidence_upload',
    EVIDENCE_VERIFY = 'evidence_verify',
    EVIDENCE_CORRECT = 'evidence_correct',
    OBJECTION_SUBMIT = 'objection_submit',
    OBJECTION_HANDLE = 'objection_handle',
    CASE_CREATE = 'case_create',
    CASE_UPDATE = 'case_update',
    CASE_DELETE = 'case_delete',
  }
  
  export enum OperationTargetType {
    CASE = 'case',
    EVIDENCE = 'evidence',
    OBJECTION = 'objection',
  }

/* =========================
 * 类型
 * ========================= */

export interface ListOperationLogsParams {
  page?: number;
  pageSize?: number;
  userId?: string;
  operationType?: OperationType;
  targetType?: OperationTargetType;
  targetId?: string;
  from?: string;
  to?: string;
  requestId?: string;
}

export interface OperationLogDTO {
  _id: string;
  userId: {
    _id: string;
    name: string;
    email: string;
    role: string;
  };
  operationType: OperationType;
  targetType: OperationTargetType;
  targetId: string;
  description: string;
  ipAddress?: string;
  userAgent?: string;
  requestId?: string;
  createdAt: string;
}