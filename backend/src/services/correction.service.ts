import Evidence from '../models/evidence.model';
import Correction, { ICorrection } from '../models/correction.model';
import Case, { CaseStatus, ICase } from '../models/case.model';
import { AuthenticatedUserPayload } from '../middleware/auth';
import { ForbiddenError } from '../utils/errors';
import { UserRole } from '../models/users.model';
import { CreateCorrectionDTO, UpdateCorrectionDTO } from '../dto/correction.dto';
import { NotFoundError, BadRequestError } from '../utils/errors';
import { addCorrectionToBlockchain } from '../utils/blockchain';

export const createCorrection = async (payload: CreateCorrectionDTO): Promise<ICorrection> => {
    const casedDoc = await Case.findById(payload.caseId);
    if (!casedDoc) {
        throw new NotFoundError('Case not found');
    }

    const originalEvidence = await Evidence.findById(payload.originalEvidenceId);
    if (!originalEvidence) {
        throw new NotFoundError('Original evidence not found');
    }

    if (!originalEvidence.blockchainEvidenceId) {
        throw new BadRequestError('Original evidence has no blockchain reference');
    }

    if (originalEvidence.caseId.toString() !== casedDoc._id.toString()) {
        throw new BadRequestError('Original evidence does not belong to provided case');
    }

    const { correctionEvidenceId, txHash } = await addCorrectionToBlockchain(
        originalEvidence.blockchainEvidenceId,
        casedDoc.caseNumber,
        payload.fileHash,
        payload.reason
    );

    const correction = new Correction({
        correctionId: crypto.randomUUID(),
        caseId: payload.caseId,
        originalEvidenceId: payload.originalEvidenceId,
        submittedBy: payload.submittedBy,
        reason: payload.reason,
        fileHash: payload.fileHash,
        blockchainEvidenceId: correctionEvidenceId,
        blockchainTxHash: txHash,
    });

    return correction.save();
};

export const updateCorrectionInternal = async (id: string, updates: UpdateCorrectionDTO): Promise<ICorrection> => {
    const updated = await Correction.findByIdAndUpdate(id, updates, { new: true });
    if (!updated) {
        throw new NotFoundError('Correction not found');
    }
    return updated;
};

export const deleteCorrectionInternal = async (id: string): Promise<void> => {
    const deleted = await Correction.findByIdAndDelete(id);
    if (!deleted) {
        throw new NotFoundError('Correction not found');
    }
};

export const getCorrectionById = async (id: string): Promise<ICorrection | null> => {
    return Correction.findById(id)
        .populate('originalEvidenceId')
        .populate('submittedBy', 'name email role');
};

export const listCorrectionsByEvidence = async (evidenceId: string): Promise<ICorrection[]> => {
    return Correction.find({ originalEvidenceId: evidenceId })
        .populate('originalEvidenceId')
        .populate('submittedBy', 'name email role');
}



/**
 * 校验：当前用户是否是该案件中的检察官
 */
export const assertAssignedProsecutor = (caseDoc: ICase, user: AuthenticatedUserPayload) => {
    if (
        user.role !== UserRole.PROSECUTOR ||
        !caseDoc.prosecutorIds?.some(id => id.toString() === user.userId)
    ) {
        throw new ForbiddenError('Only assigned prosecutor can perform this operation');
    }
};

/**
 * 校验：是否允许在当前案件状态下操作 Correction
 */
export const assertCorrectionStageAllowed = (caseDoc: ICase) => {
    if (caseDoc.status !== CaseStatus.PROSECUTORATE) {
        throw new ForbiddenError('Corrections are only allowed during prosecution stage');
    }
};