import mongoose, { Document, Schema } from 'mongoose';

export enum OperationType {
  GET = 'get',
  BATCHGET = 'batchget',
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  FIND = 'find',
  VERIFY = 'verify',
  SUBMIT = 'submit',
  HANDLE = 'handle',
}


export enum OperationTargetType {
  CASE = 'case',
  CORRECTION = 'correction',
  DEFENSE_MATERIAL = 'defense_material',
  EVIDENCE = 'evidence',
  OBJECTION = 'objection',
  USER = 'user',
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