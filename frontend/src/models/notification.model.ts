export enum NotificationType {
    EVIDENCE_CORRECTION_REQUIRED = 'evidence_correction_required',
    OBJECTION_SUBMITTED = 'objection_submitted',
    CORRECTION_COMPLETED = 'correction_completed',
    EVIDENCE_VERIFIED = 'evidence_verified',
    CASE_STATUS_CHANGED = 'case_status_changed',
    CASE_CREATED = 'case_created',
    EVIDENCE_UPLOADED = 'evidence_uploaded',
    CASE_SUBMITTED = 'case_submitted',
    CASE_CLOSED = 'case_closed',
    SYSTEM_NOTIFICATION = 'system_notification',
  }
  
  export enum NotificationPriority {
    LOW = 'low',
    NORMAL = 'normal',
    HIGH = 'high',
    URGENT = 'urgent',
  }
  
  export enum PushStatus {
    PENDING = 'pending',
    SENT = 'sent',
    FAILED = 'failed',
  }
  
  
  export interface PaginationResult<T> {
    items: T[];
    page: number;
    pageSize: number;
    total: number;
  }
  
  export interface NotificationDTO {
    _id: string;
    userId: any;
    senderId?: any;
    title: string;
    content: string;
    type: NotificationType;
    priority: NotificationPriority;
    isRead: boolean;
    pushStatus: PushStatus;
    createdAt: string;
    readAt?: string;
    pushedAt?: string;
    relatedCaseId?: any;
    relatedEvidenceId?: any;
    relatedObjectionId?: any;
  }
  
export interface CreateNotificationParams {
  title: string;
  content: string;
  type: NotificationType;
  priority?: NotificationPriority;
  targetRoles?: string[];
  targetUserIds?: string[];
  relatedCaseId?: string;
  relatedEvidenceId?: string;
  relatedObjectionId?: string;
}

export interface ListAdminNotificationsParams {
  page?: number;
  pageSize?: number;
  isRead?: boolean;
  userId?: string;
  type?: NotificationType;
  priority?: NotificationPriority;
}

export interface UpdateNotificationParams {
  title?: string;
  content?: string;
  type?: NotificationType;
  priority?: NotificationPriority;
  pushStatus?: PushStatus;
}