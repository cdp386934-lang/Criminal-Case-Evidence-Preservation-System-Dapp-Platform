import mongoose, { Document, Schema } from 'mongoose';
export interface CreateDefenseMaterialDTO {
  caseId: string;
  lawyerId: string;
  title: string;
  description?: string;
  fileHash: string;
  fileName: string;
  filePath?: string;
  fileSize: number;
  fileType: string;
  materialType: MaterialType;
}

export interface UpdateDefenseMaterialDTO {
  title?: string;
  description?: string;
  materialType?: MaterialType;
}


export enum MaterialType {
  DEFENSE_BRIEF = 'defense_brief', // 辩护词
  EVIDENCE_SUBMISSION = 'evidence_submission', // 证据提交
  WITNESS_STATEMENT = 'witness_statement', // 证人证言
  EXPERT_OPINION = 'expert_opinion', // 专家意见
  OTHER = 'other', // 其他
}


export interface AddMaterialBody {
  caseId: string;
  title: string;
  description?: string;
  fileHash: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  materialType: string;
}

export interface IDefenseMaterial extends Document {
  caseId: mongoose.Types.ObjectId; // 案件ID
  lawyerId: mongoose.Types.ObjectId; // 律师ID
  title: string; // 材料标题
  description?: string; // 材料描述
  fileHash: string; // SHA-256 哈希
  fileName: string; // 原始文件名
  filePath?: string; // 文件存储路径
  fileSize: number; // 文件大小（字节）
  fileType: string; // MIME类型
  materialType: MaterialType; // 材料类型
  blockchainTxHash?: string; // 区块链交易哈希
  blockchainMaterialId?: number; // 链上材料ID
  createdAt: Date;
  updatedAt: Date;
}

const DefenseMaterialSchema = new Schema<IDefenseMaterial>(
  {
    caseId: {
      type: Schema.Types.ObjectId,
      ref: 'Case',
      required: true,
      index: true,
    },
    lawyerId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
    },
    fileHash: {
      type: String,
      required: true,
      index: true,
    },
    fileName: {
      type: String,
      required: true,
    },
    filePath: {
      type: String,
    },
    fileSize: {
      type: Number,
      required: true,
    },
    fileType: {
      type: String,
      required: true,
    },
    materialType: {
      type: String,
      enum: Object.values(MaterialType),
      required: true,
    },
    blockchainTxHash: {
      type: String,
      index: true,
    },
    blockchainMaterialId: {
      type: Number,
    },
  },
  {
    timestamps: true,
  }
);

// 索引
DefenseMaterialSchema.index({ caseId: 1, createdAt: -1 });
DefenseMaterialSchema.index({ lawyerId: 1 });
DefenseMaterialSchema.index({ fileHash: 1 });

export default mongoose.model<IDefenseMaterial>('DefenseMaterial', DefenseMaterialSchema);

