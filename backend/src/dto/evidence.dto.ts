import { EvidenceStatus, EvidenceType } from "../models/evidence.model";

export interface CreateEvidenceDTO {
    caseId: string;
    uploaderId: string;
    title: string;
    description?: string;
    fileHash: string;
    fileName: string;
    fileType: string;
    fileSize: number;
    evidenceType: EvidenceType;
  }
  
  export interface UpdateEvidenceDTO {
    title?: string;
    description?: string;
    evidenceType?: EvidenceType;
    status?: EvidenceStatus;
  }