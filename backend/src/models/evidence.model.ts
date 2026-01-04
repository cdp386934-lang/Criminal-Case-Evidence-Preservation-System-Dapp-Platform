import mongoose, { Document, Schema } from 'mongoose';

export enum EvidenceType {
  IMAGE = 'image',
  VIDEO = 'video',
  AUDIO = 'audio',
  PDF = 'pdf',
  DOCUMENT = 'document',
  OTHER = 'other',
}
export enum EvidenceStatus {
  PENDING = 'pending',
  VERIFIED = 'verified',
  REJECTED = 'rejected',
  CORRECTED = 'corrected',
}

export interface IEvidence extends Document {
  evidenceId: string; // 唯一标识
  caseId: mongoose.Types.ObjectId; // 案件ID
  uploaderId: mongoose.Types.ObjectId; // 上传者ID
  title: string; // 证据标题
  description?: string; // 证据描述
  fileHash: string; // SHA-256 哈希
  fileName: string; // 原始文件名
  filePath: string; // 文件存储路径
  fileSize: number; // 文件大小（字节）
  fileType: string; // MIME类型
  evidenceType: EvidenceType; // 证据类型
  blockchainTxHash?: string; // 区块链交易哈希
  blockchainEvidenceId?: number; // 链上证据ID
  status: EvidenceStatus;
  originalEvidenceId?: mongoose.Types.ObjectId; // 如果是补正，指向原证据
  correctionReason?: string; // 补正原因
  verifiedBy?: mongoose.Types.ObjectId; // 核验人ID
  verifiedAt?: Date; // 核验时间
  createdAt: Date;
  updatedAt: Date;
}

const EvidenceSchema = new Schema<IEvidence>(
  {
    evidenceId: {
      type: String,
      required: true,
      unique: true,
    },
    caseId: {
      type: Schema.Types.ObjectId,
      ref: 'Case',
      required: true,
    },
    uploaderId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
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
      //required: true,
      require:false,
    },
    fileSize: {
      type: Number,
      required: true,
    },
    fileType: {
      type: String,
      required: true,
    },
    evidenceType: {
      type: String,
      enum: Object.values(EvidenceType),
      required: true,
    },
    blockchainTxHash: {
      type: String,
      index: true,
    },
    blockchainEvidenceId: {
      type: Number,
    },
    status: {
      type: String,
      enum: Object.values(EvidenceStatus),
      default: EvidenceStatus.PENDING,
    },
    originalEvidenceId: {
      type: Schema.Types.ObjectId,
      ref: 'Evidence',
    },
    correctionReason: {
      type: String,
    },
    verifiedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    verifiedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

// 索引
EvidenceSchema.index({ caseId: 1 });
EvidenceSchema.index({ uploaderId: 1 });
EvidenceSchema.index({ fileHash: 1 });
EvidenceSchema.index({ blockchainEvidenceId: 1 });
EvidenceSchema.index({ createdAt: -1 });

export default mongoose.model<IEvidence>('Evidence', EvidenceSchema);

