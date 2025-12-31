// 补正状态
export type CorrectionStatus = 'pending' | 'approved' | 'rejected';

// 补正接口
export interface Correction {
  _id: string;
  caseId: string;
  originalEvidenceId: string;
  submittedBy: string;
  reason: string;
  fileHash: string;
  status: CorrectionStatus;
  createdAt: string;
  updatedAt: string;
}


export interface CreateCorrectionDTO {
  caseId: string;
  originalEvidenceId: string;
  reason: string;
  fileHash: string;
}

export interface UpdateCorrectionDTO {
  reason?: string;
  status?: 'pending' | 'approved' | 'rejected';
}