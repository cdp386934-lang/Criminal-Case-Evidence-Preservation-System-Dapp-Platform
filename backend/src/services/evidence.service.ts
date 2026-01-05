import { IEvidence } from "../models/evidence.model";
import Case from "../models/case.model";
import { NotFoundError } from "../utils/errors";
import Evidence,{EvidenceStatus}from "../models/evidence.model";
import { addEvidenceToBlockchain} from "../utils/blockchain";
import { CreateEvidenceDTO, UpdateEvidenceDTO } from "../dto/evidence.dto";


export const createEvidence = async (payload: CreateEvidenceDTO): Promise<IEvidence> => {
    const casedDoc = await Case.findById(payload.caseId);
    if (!casedDoc) {
      throw new NotFoundError('Case not found');
    }
  
    const { evidenceId, txHash } = await addEvidenceToBlockchain(casedDoc.caseNumber, payload.fileHash);
    const evidenceUUID = crypto.randomUUID();
  
    const evidence = new Evidence({
      evidenceId: evidenceUUID,
      caseId: payload.caseId,
      uploaderId: payload.uploaderId,
      title: payload.title,
      description: payload.description,
      fileHash: payload.fileHash,
      fileName: payload.fileName,
      fileType: payload.fileType,
      fileSize: payload.fileSize,
      evidenceType: payload.evidenceType,
      blockchainEvidenceId: evidenceId,
      blockchainTxHash: txHash,
      status: EvidenceStatus.VERIFIED,
    });
  
    return evidence.save();
  };
  
  export const updateEvidenceInternal = async (id: string, updates: UpdateEvidenceDTO): Promise<IEvidence> => {
    const updated = await Evidence.findByIdAndUpdate(id, updates, { new: true });
    if (!updated) {
      throw new NotFoundError('Evidence not found');
    }
    return updated;
  };
  
 export const deleteEvidenceInternal = async (id: string): Promise<void> => {
    const deleted = await Evidence.findByIdAndDelete(id);
    if (!deleted) {
      throw new NotFoundError('Evidence not found');
    }
  };
  
 export  const getEvidenceById = async (id: string): Promise<IEvidence | null> => {
    return Evidence.findById(id);
  };
  
  export const listEvidenceByCaseInternal = async (caseId: string): Promise<IEvidence[]> => {
    return Evidence.find({ caseId }).sort({ createdAt: -1 });
  };