import mongoose, { Document, Schema } from 'mongoose';

export enum NotificationType {
  EVIDENCE_CORRECTION_REQUIRED = 'evidence_correction_required', // 证据需补正
  OBJECTION_SUBMITTED = 'objection_submitted', // 质证意见提交
  CORRECTION_COMPLETED = 'correction_completed', // 补正完成
  EVIDENCE_VERIFIED = 'evidence_verified', // 证据已核验
  CASE_STATUS_CHANGED = 'case_status_changed', // 案件状态变更
  CASE_CREATED = 'case_created', // 案件创建
  EVIDENCE_UPLOADED = 'evidence_uploaded', // 证据上传
  CASE_SUBMITTED = 'case_submitted', // 案件提交
  CASE_CLOSED = 'case_closed', // 案件结案
  SYSTEM_NOTIFICATION = 'system_notification', // 系统通知（管理员创建）
}

export enum NotificationPriority {
  LOW = 'low', // 低优先级
  NORMAL = 'normal', // 普通优先级
  HIGH = 'high', // 高优先级
  URGENT = 'urgent', // 紧急
}

export enum PushStatus {
  PENDING = 'pending', // 待推送
  SENT = 'sent', // 已推送
  FAILED = 'failed', // 推送失败
}

export interface INotification extends Document {
  userId: mongoose.Types.ObjectId; // 接收用户ID
  senderId?: mongoose.Types.ObjectId; // 发送者ID（系统通知时为管理员ID）
  type: NotificationType; // 通知类型
  title: string; // 通知标题
  content: string; // 通知内容
  priority: NotificationPriority; // 优先级
  relatedCaseId?: mongoose.Types.ObjectId; // 关联案件ID
  relatedEvidenceId?: mongoose.Types.ObjectId; // 关联证据ID
  relatedObjectionId?: mongoose.Types.ObjectId; // 关联质证ID
  isRead: boolean; // 是否已读
  pushStatus: PushStatus; // 推送状态
  createdAt: Date;
  readAt?: Date; // 阅读时间
  pushedAt?: Date; // 推送时间
}

const NotificationSchema = new Schema<INotification>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    senderId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      index: true,
    },
    type: {
      type: String,
      enum: Object.values(NotificationType),
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
    priority: {
      type: String,
      enum: Object.values(NotificationPriority),
      default: NotificationPriority.NORMAL,
      index: true,
    },
    relatedCaseId: {
      type: Schema.Types.ObjectId,
      ref: 'Case',
    },
    relatedEvidenceId: {
      type: Schema.Types.ObjectId,
      ref: 'Evidence',
    },
    relatedObjectionId: {
      type: Schema.Types.ObjectId,
      ref: 'Objection',
    },
    isRead: {
      type: Boolean,
      default: false,
      index: true,
    },
    pushStatus: {
      type: String,
      enum: Object.values(PushStatus),
      default: PushStatus.PENDING,
      index: true,
    },
    readAt: {
      type: Date,
    },
    pushedAt: {
      type: Date,
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
);

// 索引
NotificationSchema.index({ userId: 1, isRead: 1 });
NotificationSchema.index({ userId: 1, pushStatus: 1 });
NotificationSchema.index({ createdAt: -1 });
NotificationSchema.index({ priority: 1, createdAt: -1 });

export default mongoose.model<INotification>('Notification', NotificationSchema);

