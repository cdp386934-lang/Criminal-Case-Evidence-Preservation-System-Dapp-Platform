// 修正控制器
import { NextFunction, Response } from 'express';
import crypto from 'crypto';
import { AuthRequest, AuthenticatedUserPayload } from '../middleware/auth';
import { UserRole } from '../models/users.model';
import { CaseStatus } from '../models/case.model';
import Case, { ICase } from '../models/case.model';
import Correction, { ICorrection } from '../models/correction.model';
import Evidence from '../models/evidence.model';
import { CreateCorrectionDTO, UpdateCorrectionDTO, AddCorrectionBody } from '../models/correction.model';
import { addCorrectionToBlockchain } from '../utils/blockchain';
import { requireRole } from '../types/rbac';
import { BadRequestError, ForbiddenError, NotFoundError } from '../utils/errors';
import { sendSuccess } from '../utils/response';

/**
 * Case Service Helper Functions
 */
const getCaseById = async (caseId: string): Promise<ICase | null> => {
  return Case.findById(caseId);
};

const isCaseParticipant = (caseDocument: ICase, userId: string, role: UserRole): boolean => {
  const normalizedUserId = userId.toString();

  if (role === UserRole.POLICE) {
    return caseDocument.policeId?.toString() === normalizedUserId;
  }

  if (role === UserRole.PROSECUTOR) {
    return caseDocument.prosecutorIds?.some(id => id.toString() === normalizedUserId) || false;
  }

  if (role === UserRole.JUDGE) {
    return caseDocument.judgeIds?.some(id => id.toString() === normalizedUserId) || false;
  }

  if (role === UserRole.LAWYER) {
    return caseDocument.lawyerIds?.some(id => id.toString() === normalizedUserId) || false;
  }

  return false;
};

/**
 * Evidence Service Helper Functions
 */
const getEvidenceById = async (id: string) => {
  return Evidence.findById(id);
};

/**
 * Correction Service Functions
 */
const createCorrection = async (payload: CreateCorrectionDTO): Promise<ICorrection> => {
  const caseDocument = await Case.findById(payload.caseId);
  if (!caseDocument) {
    throw new NotFoundError('Case not found');
  }

  const originalEvidence = await Evidence.findById(payload.originalEvidenceId);
  if (!originalEvidence) {
    throw new NotFoundError('Original evidence not found');
  }

  if (!originalEvidence.blockchainEvidenceId) {
    throw new BadRequestError('Original evidence has no blockchain reference');
  }

  if (originalEvidence.caseId.toString() !== caseDocument._id.toString()) {
    throw new BadRequestError('Original evidence does not belong to provided case');
  }

  const { correctionEvidenceId, txHash } = await addCorrectionToBlockchain(
    originalEvidence.blockchainEvidenceId,
    caseDocument.caseNumber,
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

const updateCorrectionInternal = async (id: string, updates: UpdateCorrectionDTO): Promise<ICorrection> => {
  const updated = await Correction.findByIdAndUpdate(id, updates, { new: true });
  if (!updated) {
    throw new NotFoundError('Correction not found');
  }
  return updated;
};

const deleteCorrectionInternal = async (id: string): Promise<void> => {
  const deleted = await Correction.findByIdAndDelete(id);
  if (!deleted) {
    throw new NotFoundError('Correction not found');
  }
};

const getCorrectionById = async (id: string): Promise<ICorrection | null> => {
  return Correction.findById(id)
    .populate('originalEvidenceId')
    .populate('submittedBy', 'name email role');
};

const listCorrectionsByEvidence = async (evidenceId: string): Promise<ICorrection[]> => {
  return Correction.find({ originalEvidenceId: evidenceId }).sort({ createdAt: -1 });
};


type ControllerHandler = (req: AuthRequest, res: Response, next: NextFunction) => Promise<void>;

const ensureParticipant = async (caseId: string, user?: AuthenticatedUserPayload) => {
  if (!user) {
    throw new ForbiddenError('Authentication required');
  }
  const caseDocument = await getCaseById(caseId);
  if (!caseDocument) {
    throw new NotFoundError('Case not found');
  }

  const hasAccess = isCaseParticipant(caseDocument, user.userId, user.role);
  if (!hasAccess) {
    throw new ForbiddenError('You are not assigned to this case');
  }

  return caseDocument;
};

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
  if (![CaseStatus.PROCURATORATE].includes(caseDocument.status)) {
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
    ![CaseStatus.PROCURATORATE].includes(caseDocument.status)
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
  if (![CaseStatus.PROCURATORATE].includes(caseDocument.status)) {
    throw new ForbiddenError('Corrections can only be removed during review or prosecution');
  }

    await deleteCorrectionInternal(req.params.id);
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


