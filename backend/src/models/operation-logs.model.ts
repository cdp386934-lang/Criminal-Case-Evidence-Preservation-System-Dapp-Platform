import mongoose, { Document, Schema } from 'mongoose';

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

export interface IOperationLog extends Document {
  userId: mongoose.Types.ObjectId;
  operationType: OperationType;
  targetType: OperationTargetType;
  targetId: mongoose.Types.ObjectId;
  description: string;
  ipAddress?: string;
  userAgent?: string;
  requestId?: string;
  createdAt: Date;
}

const OperationLogSchema = new Schema<IOperationLog>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    operationType: {
      type: String,
      enum: Object.values(OperationType),
      required: true,
      index: true,
    },
    targetType: {
      type: String,
      enum: Object.values(OperationTargetType),
      required: true,
    },
    targetId: {
      type: Schema.Types.ObjectId,
      required: true,
      index: true,
    },
    description: {
      type: String,
      required: true,
    },
    ipAddress: String,
    userAgent: String,
    requestId: {
      type: String,
      index: true,
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
);

OperationLogSchema.index({ createdAt: -1 });

export default mongoose.model<IOperationLog>('OperationLog', OperationLogSchema);