export type EvidenceType = 'document' | 'audio' | 'video' | 'image' | 'other';

// 证据状态
export type EvidenceStatus = 'pending' | 'verified' | 'rejected' | 'corrected';

// 证据接口
export interface Evidence {
  _id: string;
  caseId: string;
  uploaderId: string;
  title: string;
  description?: string;
  fileHash: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  evidenceType: EvidenceType;
  status: EvidenceStatus;
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