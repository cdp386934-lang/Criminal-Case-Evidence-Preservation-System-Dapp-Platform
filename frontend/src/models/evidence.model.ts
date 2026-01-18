export type EvidenceType = 'document' | 'audio' | 'video' | 'image' | 'other';

// 证据状态
export type EvidenceStatus = 'pending' | 'approved' | 'rejected' | 'corrected'; // approved: 已批准（原verified，police验证通过）

// 证据接口
export interface Evidence {
  _id: string;
  evidenceId?: string; // 证据唯一标识
  caseId: string;
  uploaderId: string | {
    _id: string;
    name: string;
    role: string;
  };
  title: string;
  description?: string;
  fileHash: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  evidenceType: EvidenceType;
  status: EvidenceStatus;
  verifiedBy?: string | {
    _id: string;
    name: string;
  };
  verifiedAt?: string;
  correctionReason?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateEvidenceDTO {
  caseId: string;
  title: string;
  description?: string;
  fileHash: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  evidenceType: string;
}

export interface UpdateEvidenceDTO {
  title?: string;
  description?: string;
  evidenceType?: string;
}