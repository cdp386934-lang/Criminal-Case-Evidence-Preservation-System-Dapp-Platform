import mongoose, { Document, Schema } from 'mongoose';
import { CaseStatus } from './case.model';
import { UserRole } from './users.model';

export interface ICaseTimeline extends Document {
  caseId: mongoose.Types.ObjectId; // 案件ID
  stage: CaseStatus; // 案件阶段
  operatorRole: UserRole; // 操作者角色
  operatorId: mongoose.Types.ObjectId; // 操作者ID
  operatorAddress?: string; // 操作者钱包地址
  comment?: string; // 备注说明
  timestamp: Date; // 操作时间
  createdAt: Date;
  updatedAt: Date;
}

const CaseTimelineSchema = new Schema<ICaseTimeline>(
  {
    caseId: {
      type: Schema.Types.ObjectId,
      ref: 'Case',
      required: true,
      index: true,
    },
    stage: {
      type: String,
      enum: Object.values(CaseStatus),
      required: true,
    },
    operatorRole: {
      type: String,
      enum: Object.values(UserRole),
      required: true,
    },
    operatorId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    operatorAddress: {
      type: String,
      lowercase: true,
      trim: true,
    },
    comment: {
      type: String,
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// 索引
CaseTimelineSchema.index({ caseId: 1, timestamp: -1 });
CaseTimelineSchema.index({ operatorId: 1 });

export default mongoose.model<ICaseTimeline>('CaseTimeline', CaseTimelineSchema);

