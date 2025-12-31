import mongoose, { Document, Schema } from 'mongoose';

export enum CaseStatus {
  INVESTIGATION = 'INVESTIGATION', // 侦查中
  PROSECUTORATE = 'PROSECUTORATE', // 起诉
  COURT_TRIAL = 'COURT_TRIAL',     // 法院审理
  CLOSED = 'CLOSED',               // 结案
}

export enum CaseType {
  PUBLIC_PROSECUTION = 'PUBLIC_PROSECUTION', // 公诉
  CIVIL_LITIGATION = 'CIVIL_LITIGATION',     // 民事诉讼
}

/**
 * 推进案件状态请求体
 *（模型中保留，用于 controller 类型约束）
 */
export interface MoveCaseNextStageBody {
  targetStatus?: CaseStatus;
  comment?: string;
  operatorAddress?: string;
}

export interface ICase extends Document {
  caseNumber: string;
  caseTitle: string;
  caseType: CaseType;

  /** 公诉案件 */
  prosecutorIds?: mongoose.Types.ObjectId[];

  /** 民事案件 */
  plaintiffLawyerIds?: mongoose.Types.ObjectId[];

  /** 通用 */
  defendantLawyerIds?: mongoose.Types.ObjectId[];

  description?: string;
  plaintiffMessage?: string;
  defendantMessage?: string;

  /** 案件参与人员 */
  policeId?: mongoose.Types.ObjectId;
  judgeId?: mongoose.Types.ObjectId;

  status: CaseStatus;

  createdAt: Date;
  updatedAt: Date;
}

const CaseSchema = new Schema<ICase>(
  {
    caseNumber: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },

    caseTitle: {
      type: String,
      required: true,
    },

    caseType: {
      type: String,
      enum: Object.values(CaseType),
      required: true,
    },

    description: {
      type: String,
    },

    /** ===== 角色分离字段 ===== */

    prosecutorIds: [
      {
        type: Schema.Types.ObjectId,
        ref: 'User',
      },
    ],

    plaintiffLawyerIds: [
      {
        type: Schema.Types.ObjectId,
        ref: 'User',
      },
    ],

    defendantLawyerIds: [
      {
        type: Schema.Types.ObjectId,
        ref: 'User',
      },
    ],

    /** ===== 指派人员 ===== */

    policeId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },

    judgeId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },

    status: {
      type: String,
      enum: Object.values(CaseStatus),
      default: CaseStatus.INVESTIGATION,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

/** ===== 常用查询索引 ===== */
CaseSchema.index({ prosecutorIds: 1 });
CaseSchema.index({ plaintiffLawyerIds: 1 });
CaseSchema.index({ defendantLawyerIds: 1 });
CaseSchema.index({ policeId: 1 });
CaseSchema.index({ judgeId: 1 });

export default mongoose.model<ICase>('Case', CaseSchema);
