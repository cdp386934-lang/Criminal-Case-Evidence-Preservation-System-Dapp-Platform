import mongoose, { Document, Schema } from 'mongoose';

export enum CorrectionStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
}

export interface AddCorrectionBody {
  caseId: string;
  originalEvidenceId: string;
  reason: string;
  fileHash: string;
}


export interface CreateCorrectionDTO {
  caseId: string;
  originalEvidenceId: string;
  submittedBy: string;
  reason: string;
  fileHash: string;
}

export interface UpdateCorrectionDTO {
  reason?: string;
  status?: CorrectionStatus;
}
export interface ICorrection extends Document {
  correctionId: string;
  caseId: mongoose.Types.ObjectId;
  originalEvidenceId: mongoose.Types.ObjectId;
  submittedBy: mongoose.Types.ObjectId;
  reason: string;
  fileHash: string;
  blockchainTxHash?: string;
  blockchainEvidenceId?: number;
  status: CorrectionStatus;
  createdAt: Date;
  updatedAt: Date;
}

const CorrectionSchema = new Schema<ICorrection>(
  {
    correctionId: {
      type: String,
      required: true,
      unique: true,
    },
    caseId: {
      type: Schema.Types.ObjectId,
      ref: 'Case',
      required: true,
    },
    originalEvidenceId: {
      type: Schema.Types.ObjectId,
      ref: 'Evidence',
      required: true,
    },
    submittedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    reason: {
      type: String,
      required: true,
    },
    fileHash: {
      type: String,
      required: true,
    },
    blockchainTxHash: {
      type: String,
    },
    blockchainEvidenceId: {
      type: Number,
    },
    status: {
      type: String,
      enum: Object.values(CorrectionStatus),
      default: CorrectionStatus.PENDING,
    },
  },
  {
    timestamps: true,
  }
);

CorrectionSchema.index({ caseId: 1 });
CorrectionSchema.index({ originalEvidenceId: 1 });
CorrectionSchema.index({ correctionId: 1 });

export default mongoose.model<ICorrection>('Correction', CorrectionSchema);


