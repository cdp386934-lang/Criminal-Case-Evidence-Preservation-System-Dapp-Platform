import { NextFunction, Response } from 'express';
import { AuthRequest, AuthenticatedUserPayload } from '../middleware/auth';
import { UserRole } from '../models/users.model';
import Case, {
  CaseStatus,
  CaseType,
  MoveCaseNextStageBody,
  ICase,
} from '../models/case.model';
import CaseTimeline from '../models/case-timeline.model';
import {
  OperationType,
  OperationTargetType,
} from '../models/operation-logs.model';
import { requireRole } from '../middleware/rbac';
import { BadRequestError, ForbiddenError, NotFoundError } from '../utils/errors';
import { sendSuccess } from '../utils/response';
import { isCaseParticipant, loadAndCheckCase } from '../services/case.helper.service';
import { recordOperation } from './operation-logs.controller';

interface CreateCaseBody {
  caseNumber: string;
  caseTitle: string;
  caseType: CaseType;
  description?: string;
  plaintiffMessage?: string;
  defendantMessage?: string;
  prosecutorIds?: string[];       // 公诉案件 - 检察官ID
  judgeIds?: string[];            // 通用 - 法官ID
  plaintiffLawyerIds?: string[];  // 民事诉讼 - 原告律师ID
  defendantLawyerIds?: string[];  // 民事诉讼 - 被告律师ID
  lawyerIds?: string[];           // 公诉案件 - 律师ID（通用）
}
/* =====================================================
   案件状态流转配置
===================================================== */

const WORKFLOW_TRANSITIONS: Partial<
  Record<CaseStatus, Partial<Record<UserRole, CaseStatus[]>>>
> = {
  [CaseStatus.INVESTIGATION]: {
    [UserRole.POLICE]: [CaseStatus.PROSECUTORATE],
  },
  [CaseStatus.PROSECUTORATE]: {
    [UserRole.PROSECUTOR]: [CaseStatus.COURT_TRIAL],
  },
  [CaseStatus.COURT_TRIAL]: {
    [UserRole.JUDGE]: [CaseStatus.CLOSED],
  },
};

const canTransition = (
  current: CaseStatus,
  target: CaseStatus,
  role: UserRole
) =>
  WORKFLOW_TRANSITIONS[current]?.[role]?.includes(target) ?? false;


/* =====================================================
   Controller
===================================================== */

export const createCase = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const user = requireRole(req.user, [UserRole.POLICE]);
    const payload = req.body;

    const { caseType } = payload;

    if (!payload.caseNumber || !payload.caseTitle || !caseType) {
      throw new BadRequestError('Missing required fields');
    }

    /** ===== caseType 强校验 ===== */

    if (caseType === CaseType.PUBLIC_PROSECUTION) {
      if (!payload.prosecutorIds?.length) {
        throw new BadRequestError('Public prosecution requires prosecutorIds');
      }
      if (!payload.defendantLawyerIds?.length) {
        throw new BadRequestError('Public prosecution requires defendantLawyerIds');
      }
    }

    if (caseType === CaseType.CIVIL_LITIGATION) {
      if (!payload.plaintiffLawyerIds?.length) {
        throw new BadRequestError('Civil litigation requires plaintiffLawyerIds');
      }
      if (!payload.defendantLawyerIds?.length) {
        throw new BadRequestError('Civil litigation requires defendantLawyerIds');
      }
      if (payload.prosecutorIds?.length) {
        throw new BadRequestError('Civil litigation must not include prosecutorIds');
      }
    }

    const created = await Case.create({
      ...payload,
      policeId: user.userId,
      status: CaseStatus.INVESTIGATION,
    });

    await CaseTimeline.create({
      caseId: created._id,
      stage: CaseStatus.INVESTIGATION,
      operatorRole: UserRole.POLICE,
      operatorId: user.userId,
      comment: '立案',
      timestamp: new Date(),
    });

    await recordOperation({
      req,
      operationType: OperationType.CREATE,
      targetType: OperationTargetType.CASE,
      targetId: created._id.toString(),
      description: `Created case ${created.caseNumber}`,
    });

    sendSuccess(res, created, 201);
  } catch (e) {
    next(e);
  }
};

export const updateCase = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const user = requireRole(req.user, [
      UserRole.POLICE,
      UserRole.PROSECUTOR,
      UserRole.JUDGE,
    ]);

    const caseDoc = await loadAndCheckCase(req.params.id, user);

    Object.assign(caseDoc, req.body);
    await caseDoc.save();

    await recordOperation({
      req,
      operationType: OperationType.UPDATE,
      targetType: OperationTargetType.CASE,
      targetId: caseDoc._id.toString(),
      description: `Updated case ${caseDoc.caseNumber}`,
    });

    sendSuccess(res, caseDoc);
  } catch (e) {
    next(e);
  }
};

export const deleteCase = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const user = requireRole(req.user, [UserRole.POLICE, UserRole.JUDGE]);

    const caseDoc = await loadAndCheckCase(req.params.id, user);
    await caseDoc.deleteOne();

    await recordOperation({
      req,
      operationType: OperationType.DELETE,
      targetType: OperationTargetType.CASE,
      targetId: caseDoc._id.toString(),
      description: `Deleted case ${caseDoc.caseNumber}`,
    });

    sendSuccess(res, null, 204);
  } catch (e) {
    next(e);
  }
};

export const getCase = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const user = requireRole(req.user, Object.values(UserRole) as UserRole[]);
    const caseDoc = await loadAndCheckCase(req.params.id, user);

    sendSuccess(res, caseDoc);
  } catch (e) {
    next(e);
  }
};

export const listCases = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const user = requireRole(req.user, Object.values(UserRole) as UserRole[]);

    const query =
      user.role === UserRole.POLICE
        ? { policeId: user.userId }
        : user.role === UserRole.PROSECUTOR
          ? { prosecutorIds: user.userId }
          : user.role === UserRole.JUDGE
            ? { judgeId: user.userId }
            : {
              $or: [
                { plaintiffLawyerIds: user.userId },
                { defendantLawyerIds: user.userId },
              ],
            };

    const cases = await Case.find(query).sort({ createdAt: -1 });
    sendSuccess(res, cases);
  } catch (e) {
    next(e);
  }
};

export const moveCaseNextStage = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const user = requireRole(req.user, [
      UserRole.POLICE,
      UserRole.PROSECUTOR,
      UserRole.JUDGE,
    ]);

    const payload = req.body as MoveCaseNextStageBody;
    const caseDoc = await loadAndCheckCase(req.params.id, user);

    if (caseDoc.status === CaseStatus.CLOSED) {
      throw new BadRequestError('Case already closed');
    }

    if (!payload.targetStatus) {
      throw new BadRequestError('targetStatus is required');
    }

    if (!canTransition(caseDoc.status, payload.targetStatus, user.role)) {
      throw new BadRequestError('Transition not allowed');
    }

    const fromStatus = caseDoc.status;
    caseDoc.status = payload.targetStatus;
    await caseDoc.save();

    await CaseTimeline.create({
      caseId: caseDoc._id,
      stage: payload.targetStatus,
      operatorRole: user.role,
      operatorId: user.userId,
      comment: payload.comment,
      timestamp: new Date(),
    });
    await recordOperation({
      req,
      operationType: OperationType.UPDATE,
      targetType: OperationTargetType.CASE,
      targetId: caseDoc._id.toString(),
      description: `Changed case ${caseDoc.caseNumber} status from ${fromStatus} to ${payload.targetStatus}`,
    });

    sendSuccess(res, caseDoc);
  } catch (e) {
    next(e);
  }
};

export const getCaseTimeline = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    await loadAndCheckCase(req.params.id, req.user);

    const timeline = await CaseTimeline.find({
      caseId: req.params.id,
    }).sort({ timestamp: 1 });

    sendSuccess(res, timeline);
  } catch (e) {
    next(e);
  }
};
