import mongoose, { Document, Schema } from 'mongoose';

export enum CaseStatus {
  INVESTIGATION = 'INVESTIGATION', // 侦查中
  PROCURATORATE = 'PROCURATORATE', // 起诉
  COURT_TRIAL = 'COURT_TRIAL', // 法院审理
  CLOSED = 'CLOSED', // 结案
}

export enum CaseType {
  PUBLIC_PROSECUTION = 'public_prosecution', // 公诉:
  CIVIL_LITIGATION = 'civil_litigation'  //民事诉讼；
}

/**
 * 推进案件状态的请求体接口
 */
export interface MoveCaseNextStageBody {
  targetStatus?: CaseStatus; // 目标状态（可选，不提供则自动推断）
  comment?: string; // 备注说明
  operatorAddress?: string; // 操作者钱包地址
}


export interface ICase extends Document {
  caseNumber: string;
  caseTitle: string;
  caseType: CaseType;
  //根据caseType的特定字段
  lawyerIds?: mongoose.Types.ObjectId[];//律师
  prosecutorIds?: mongoose.Types.ObjectId[];//检察官
  plaintiffLawyerIds?: mongoose.Types.ObjectId[];//原告律师
  defendantLawyerIds?: mongoose.Types.ObjectId[];//被告律师
  //通用字段
  description?: string;
  plaintiffMessage?: string;
  defendantMessage?: string;
  judgeIds?: mongoose.Types.ObjectId[];
  policeId?: mongoose.Types.ObjectId;
  status: CaseStatus;
  caseCreatedAt: Date;
  updatedAt: Date;
}

const CaseSchema = new Schema<ICase>(
  {
    caseNumber: {
      type: String,
      required: true,
      unique: true,
    },
    caseTitle: {
      type: String,
      required: true,
    },
    caseType: {
      type: String,
      enum: Object.values(CaseType),
      default: CaseType.PUBLIC_PROSECUTION,
    },
    description: {
      type: String,
    },
    prosecutorIds: [
      {
        type: Schema.Types.ObjectId,
        ref: 'User', // 关联检察官用户
      },
    ],
    policeId: {
      type: Schema.Types.ObjectId,
      ref: 'User', // 关联立案公安用户
    },
    judgeIds: [
      {
        type: Schema.Types.ObjectId,
        ref: 'User', // 关联法官用户
      },
    ],
    plaintiffLawyerIds:[
      {
        type: Schema.Types.ObjectId,
        ref: 'User', // 关联原告律师用户
      }
    ],
    defendantLawyerIds:[
      {
        type: Schema.Types.ObjectId,
        ref: 'User', // 关联被告律师用户
      }
    ],
    status: {
      type: String,
      enum: Object.values(CaseStatus),
      default: CaseStatus.INVESTIGATION,
    },
  },
  {
    timestamps: true,
  }
);

CaseSchema.pre('validate', function (next) {
  if (this.caseType === CaseType.PUBLIC_PROSECUTION) {
    if (!this.prosecutorIds || this.prosecutorIds.length === 0) {
      return next(new Error('公诉案件必须指定检察官'));
    }
    if (
      !this.defendantLawyerIds
    ) {
      return next(new Error('公诉案件必须指定被告律师'));
    }
  }

  if (this.caseType === CaseType.CIVIL_LITIGATION) {
    if (
      !this.plaintiffLawyerIds ||
      !this.defendantLawyerIds
    ) {
      return next(new Error('民事诉讼必须指定原被告律师'));
    }
  }

  next();
});


// 索引
CaseSchema.index({ caseNumber: 1 });
CaseSchema.index({ prosecutorIds: 1 });
CaseSchema.index({ status: 1 });

export default mongoose.model<ICase>('Case', CaseSchema);

