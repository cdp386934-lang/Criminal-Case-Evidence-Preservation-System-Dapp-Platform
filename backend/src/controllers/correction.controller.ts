import { NextFunction, Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { UserRole } from '../models/users.model';
import { BadRequestError, ForbiddenError, NotFoundError } from '../utils/errors';
import { sendSuccess } from '../utils/response';
import { createCorrection, getCorrectionById, updateCorrectionInternal,listCorrectionsByEvidence} from '../services/correction.service';
import { requireRole } from '../types/rbac';
import { CaseStatus } from '../models/case.model';
import { getEvidenceById } from '../services/evidence.service';
import {ensureParticipant} from '../services/case.helper.service'
import { UpdateCorrectionDTO } from '../dto/correction.dto';
interface AddCorrectionBody {
  caseId: string;
  originalEvidenceId: string;
  reason: string;
  fileHash: string;
}

type ControllerHandler = (req: AuthRequest, res: Response, next: NextFunction) => Promise<void>;

export const addCorrection: ControllerHandler = async (req, res, next) => {
  try {
    const currentUser = requireRole(req.user, [UserRole.PROSECUTOR]);
    const payload = req.body as AddCorrectionBody;
    if (!payload.caseId || !payload.originalEvidenceId || !payload.reason || !payload.fileHash) {
      throw new BadRequestError('Missing required correction fields');
    }

    const evidence = await getEvidenceById(payload.originalEvidenceId);
    if (!evidence) {
      throw new NotFoundError('Original evidence not found');
    }
    if (evidence.caseId.toString() !== payload.caseId) {
      throw new BadRequestError('Original evidence does not belong to the provided case');
    }

    const caseDocument = await ensureParticipant(payload.caseId, currentUser);

    if (!caseDocument.prosecutorIds?.some((prosecutorId) => prosecutorId.toString() === currentUser.userId)) {
      throw new ForbiddenError('Only the assigned prosecutor can submit corrections');
    }
    if (![CaseStatus.PROSECUTORATE].includes(caseDocument.status)) {
      throw new ForbiddenError('Corrections can only be submitted during review or prosecution');
    }

    const created = await createCorrection({
      caseId: payload.caseId,
      originalEvidenceId: payload.originalEvidenceId,
      submittedBy: currentUser.userId,
      reason: payload.reason,
      fileHash: payload.fileHash,
    });

    sendSuccess(res, created, 201);
  } catch (error) {
    next(error);
  }
};

export const updateCorrection: ControllerHandler = async (req, res, next) => {
  try {
    const currentUser = requireRole(req.user, [UserRole.PROSECUTOR, UserRole.JUDGE]);

    const correction = await getCorrectionById(req.params.id);
    if (!correction) {
      throw new NotFoundError('Correction not found');
    }

    const caseDocument = await ensureParticipant(correction.caseId.toString(), currentUser);
    if (
      currentUser.role === UserRole.PROSECUTOR &&
      (!caseDocument.prosecutorIds?.some((prosecutorId) => prosecutorId.toString() === currentUser.userId))
    ) {
      throw new ForbiddenError('Only the assigned prosecutor can update this correction');
    }
    if (
      currentUser.role === UserRole.PROSECUTOR &&
      ![CaseStatus.PROSECUTORATE].includes(caseDocument.status)
    ) {
      throw new ForbiddenError('Corrections can only be modified during review or prosecution');
    }

    const updates = req.body as UpdateCorrectionDTO;
    const updated = await updateCorrectionInternal(req.params.id, updates);
    sendSuccess(res, updated);
  } catch (error) {
    next(error);
  }
};

export const deleteCorrection: ControllerHandler = async (req, res, next) => {
  try {
    const currentUser = requireRole(req.user, [UserRole.PROSECUTOR]);

    const correction = await getCorrectionById(req.params.id);
    if (!correction) {
      throw new NotFoundError('Correction not found');
    }

    const caseDocument = await ensureParticipant(correction.caseId.toString(), currentUser);
    if (!caseDocument.prosecutorIds?.some((prosecutorId) => prosecutorId.toString() === currentUser.userId)) {
      throw new ForbiddenError('Only the assigned prosecutor can delete this correction');
    }
    if (![CaseStatus.PROSECUTORATE].includes(caseDocument.status)) {
      throw new ForbiddenError('Corrections can only be removed during review or prosecution');
    }

    await updateCorrectionInternal(req.params.id,req.body as UpdateCorrectionDTO);
    sendSuccess(res, null, 204);
  } catch (error) {
    next(error);
  }
};

export const getCorrection: ControllerHandler = async (req, res, next) => {
  try {
    const correction = await getCorrectionById(req.params.id);
    if (!correction) {
      throw new NotFoundError('Correction not found');
    }

    await ensureParticipant(correction.caseId.toString(), req.user);
    sendSuccess(res, correction);
  } catch (error) {
    next(error);
  }
};

export const listCorrections: ControllerHandler = async (req, res, next) => {
  try {
    const evidence = await getEvidenceById(req.params.evidenceId);
    if (!evidence) {
      throw new NotFoundError('Evidence not found');
    }

    await ensureParticipant(evidence.caseId.toString(), req.user);
    const corrections = await listCorrectionsByEvidence(req.params.evidenceId);
    sendSuccess(res, corrections);
  } catch (error) {
    next(error);
  }
};