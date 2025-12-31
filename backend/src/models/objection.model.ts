import mongoose, { Document, Schema } from 'mongoose';

export enum ObjectionStatus {
  PENDING = 'pending',
  ACCEPTED = 'accepted',
  REJECTED = 'rejected',
}

export interface IObjection extends Document {
  objectionId: string; // 质证意见ID
  caseId: mongoose.Types.ObjectId; // 案件ID
  evidenceId: mongoose.Types.ObjectId; // 证据ID
  lawyerId: mongoose.Types.ObjectId; // 律师ID
  content: string; // 质证意见内容
  status: ObjectionStatus; // 处理状态
  handledBy?: mongoose.Types.ObjectId; // 处理人ID（法官）
  handledAt?: Date; // 处理时间
  handleResult?: string; // 处理结果说明
  isAccepted?: boolean; // 是否采信
  createdAt: Date;
  updatedAt: Date;
}

const ObjectionSchema = new Schema<IObjection>(
  {
    objectionId: {
      type: String,
      required: true,
      unique: true,
    },
    caseId: {
      type: Schema.Types.ObjectId,
      ref: 'Case',
      required: true,
    },
    evidenceId: {
      type: Schema.Types.ObjectId,
      ref: 'Evidence',
      required: true,
    },
    lawyerId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: Object.values(ObjectionStatus),
      default: ObjectionStatus.PENDING,
    },
    handledBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    handledAt: {
      type: Date,
    },
    handleResult: {
      type: String,
    },
    isAccepted: {
      type: Boolean,
    },
  },
  {
    timestamps: true,
  }
);

// 索引
ObjectionSchema.index({ caseId: 1 });
ObjectionSchema.index({ evidenceId: 1 });
ObjectionSchema.index({ lawyerId: 1 });
ObjectionSchema.index({ status: 1 });

export default mongoose.model<IObjection>('Objection', ObjectionSchema);

