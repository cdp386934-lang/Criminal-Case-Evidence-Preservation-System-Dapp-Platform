import { CorrectionStatus } from "../models/correction.model";

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