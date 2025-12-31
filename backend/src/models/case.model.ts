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

export interface AddCaseBody {
  caseNumber: string;
  caseTitle: string;
  caseType: CaseType;
  description?: string;
  plaintiffMessage?:string;
  defendantMessage?:string;
  prosecutorIds?: string[]; // 检察官ID（可选，公安立案时可能还没有）
  judgeIds?: string[]; // 法官ID数组（可选）
  lawyerIds?: string[]; // 律师ID数组（可选）
}

/**
 * 推进案件状态的请求体接口
 */
export interface MoveCaseNextStageBody {
  targetStatus?: CaseStatus; // 目标状态（可选，不提供则自动推断）
  comment?: string; // 备注说明
  operatorAddress?: string; // 操作者钱包地址
}

export interface CreateCaseDTO {
  caseNumber: string;
  caseTitle: string;
  caseType: CaseType;
  description?: string;
  plaintiffMessage?:string;
  defendantMessage?:string;
  prosecutorIds?: string[]; // 可选，公安立案时可能还没有
  judgeIds?: string[]; // 可选
  lawyerIds?: string[]; // 可选
  status?: CaseStatus;
}

export interface UpdateCaseDTO {
  caseTitle?: string;
  caseType?: CaseType;
  description?: string;
  judgeIds?: string[];
  lawyerIds?: string[];
  status?: CaseStatus;
}

export interface ICase extends Document {
  caseNumber: string; 
  caseTitle: string; 
  caseType: CaseType; 
  description?: string; 
  plaintiffMessage?:string;
  defendantMessage?:string;
  prosecutorIds?: mongoose.Types.ObjectId[]; 
  judgeIds?: mongoose.Types.ObjectId[]; 
  lawyerIds?: mongoose.Types.ObjectId[]; 
  policeId?: mongoose.Types.ObjectId; 
  status: CaseStatus; 
  caseCreatedAt: Date;
  updatedAt: Date;
  result?: string; 
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
    lawyerIds: [
      {
        type: Schema.Types.ObjectId,
        ref: 'User', // 关联律师用户
      },
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

// 索引
CaseSchema.index({ caseNumber: 1 });
CaseSchema.index({ prosecutorIds: 1 });
CaseSchema.index({ status: 1 });

export default mongoose.model<ICase>('Case', CaseSchema);

