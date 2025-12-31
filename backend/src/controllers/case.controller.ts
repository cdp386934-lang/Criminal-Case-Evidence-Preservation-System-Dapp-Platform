import { NextFunction, Response } from 'express';
import mongoose from 'mongoose';
import { AuthRequest, AuthenticatedUserPayload } from '../middleware/auth';
import { UserRole } from '../models/users.model';
import Case, { CaseStatus, MoveCaseNextStageBody, ICase } from '../models/case.model';
import { AddCaseBody, CreateCaseDTO, UpdateCaseDTO } from '../dto/case.dto';
import CaseTimeline, { ICaseTimeline } from '../models/case-timeline.model';
import { requireRole } from '../types/rbac';
import { BadRequestError, ForbiddenError, NotFoundError } from '../utils/errors';
import { sendSuccess } from '../utils/response';
import * as notificationUtils from '../utils/notification';
import { NotificationType, NotificationPriority } from '../models/notification.model';
/***
 * Todo:案件控制
 * 1.这里我需要设置成纯controller，不要service，如果service必要的话，请生成一个service文件夹进行调用
 * 2.权限在后端配置之后是否前端就不用进行权限的进一步设置了？
 * 数据结构的问题
 * 3.在公安机关创建案件的时候，是否是在后端进行判断创建案件的类型还是在前端判断（类型不同导致前端输入的参数不一致）；
 *   例如：案件是公诉，创建案件时候，则公安机关需要输入的检察官组的ids和律师组的ids；
 *         案件时民事诉讼，创建案件的时候，则公安机关需要输入两个律师组的ids,(这里区分的是原被告的律师)
 */
type ControllerHandler = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => Promise<void>;

/* =========================
   案件状态流转配置
========================= */

const WORKFLOW_TRANSITIONS: Partial<
  Record<CaseStatus, Partial<Record<UserRole, CaseStatus[]>>>
> = {
  [CaseStatus.INVESTIGATION]: {
    [UserRole.POLICE]: [
      CaseStatus.PROCURATORATE,
      CaseStatus.COURT_TRIAL,
      CaseStatus.CLOSED,
    ],
  },
  [CaseStatus.PROCURATORATE]: {
    [UserRole.PROSECUTOR]: [CaseStatus.COURT_TRIAL, CaseStatus.INVESTIGATION],
    [UserRole.JUDGE]: [CaseStatus.COURT_TRIAL],
  },
  [CaseStatus.COURT_TRIAL]: {
    [UserRole.JUDGE]: [CaseStatus.CLOSED],
  },
};

const getNextStatus = (
  current: CaseStatus,
  role: UserRole
): CaseStatus | null => {
  const list = WORKFLOW_TRANSITIONS[current]?.[role];
  return list?.[0] ?? null;
};

const canTransition = (
  current: CaseStatus,
  target: CaseStatus,
  role: UserRole
): boolean => {
  return WORKFLOW_TRANSITIONS[current]?.[role]?.includes(target) ?? false;
};

/* =========================
   权限 / 参与者判断
========================= */

const isCaseParticipant = (
  caseDoc: ICase,
  userId: string,
  role: UserRole
): boolean => {
  const uid = userId.toString();

  switch (role) {
    case UserRole.POLICE:
      return caseDoc.policeId?.toString() === uid;
    case UserRole.PROSECUTOR:
      return caseDoc.prosecutorIds?.some(id => id.toString() === uid) ?? false;
    case UserRole.JUDGE:
      return caseDoc.judgeIds?.some(id => id.toString() === uid) ?? false;
    case UserRole.LAWYER:
      return caseDoc.lawyerIds?.some(id => id.toString() === uid) ?? false;
    default:
      return false;
  }
};

const ensureCaseOwnership = async (
  caseId: string,
  user?: AuthenticatedUserPayload
): Promise<ICase> => {
  if (!user) throw new ForbiddenError('Authentication required');

  const caseDoc = await Case.findById(caseId)
    .populate('policeId prosecutorIds judgeIds lawyerIds', 'name email role');

  if (!caseDoc) throw new NotFoundError('Case not found');

  if (!isCaseParticipant(caseDoc, user.userId, user.role)) {
    throw new ForbiddenError('You are not assigned to this case');
  }

  return caseDoc;
};

/* =========================
   内部 Service
========================= */

const createCaseInternal = async (
  payload: CreateCaseDTO & { policeId: string }
): Promise<ICase> => {
  return Case.create({
    ...payload,
    policeId: new mongoose.Types.ObjectId(payload.policeId),
    prosecutorIds: payload.prosecutorIds?.map(id => new mongoose.Types.ObjectId(id)),
    judgeIds: payload.judgeIds?.map(id => new mongoose.Types.ObjectId(id)),
    lawyerIds: payload.lawyerIds?.map(id => new mongoose.Types.ObjectId(id)),
    status: payload.status ?? CaseStatus.INVESTIGATION,
  });
};

const updateCaseInternal = async (
  caseId: string,
  updates: UpdateCaseDTO
): Promise<ICase> => {
  const updated = await Case.findByIdAndUpdate(caseId, updates, { new: true });
  if (!updated) throw new NotFoundError('Case not found');
  return updated;
};

const moveCaseToNextStageInternal = async (
  caseId: string,
  role: UserRole,
  userId: string,
  operatorAddress?: string,
  targetStatus?: CaseStatus,
  comment?: string
): Promise<{ case: ICase; timeline: ICaseTimeline }> => {
  const caseDoc = await Case.findById(caseId);
  if (!caseDoc) throw new NotFoundError('Case not found');

  if (caseDoc.status === CaseStatus.CLOSED) {
    throw new BadRequestError('Case already closed');
  }

  if (!isCaseParticipant(caseDoc, userId, role)) {
    throw new ForbiddenError('No permission for this case');
  }

  const nextStatus = targetStatus ?? getNextStatus(caseDoc.status, role);
  if (!nextStatus) {
    throw new BadRequestError('Invalid workflow transition');
  }

  if (targetStatus && !canTransition(caseDoc.status, targetStatus, role)) {
    throw new BadRequestError('Transition not allowed');
  }

  caseDoc.status = nextStatus;
  await caseDoc.save();

  const timeline = await CaseTimeline.create({
    caseId: caseDoc._id,
    stage: nextStatus,
    operatorRole: role,
    operatorId: userId,
    operatorAddress,
    comment,
    timestamp: new Date(),
  });

  return { case: caseDoc, timeline };
};

/* =========================
   Controller
========================= */

export const addCase: ControllerHandler = async (req, res, next) => {
  try {
    const user = requireRole(req.user, [UserRole.POLICE]);
    const payload = req.body as AddCaseBody;

    if (!payload.caseNumber || !payload.caseTitle || !payload.caseType) {
      throw new BadRequestError('Missing required fields');
    }

    const created = await createCaseInternal({
      ...payload,
      policeId: user.userId,
      status: CaseStatus.INVESTIGATION,
    });

    await CaseTimeline.create({
      caseId: created._id,
      stage: CaseStatus.INVESTIGATION,
      operatorRole: UserRole.POLICE,
      operatorId: user.userId,
      operatorAddress: user.walletAddress,
      comment: '立案',
      timestamp: new Date(),
    });

    await notificationUtils.createNotificationsForCaseParticipants(created, {
      senderId: user.userId,
      type: NotificationType.CASE_CREATED,
      title: '新案件已创建',
      content: `案件 ${created.caseNumber} 已立案`,
      priority: NotificationPriority.HIGH,
      relatedCaseId: created._id.toString(),
    });

    sendSuccess(res, created, 201);
  } catch (e) {
    next(e);
  }
};

export const updateCase: ControllerHandler = async (req, res, next) => {
  try {
    const user = requireRole(req.user, [
      UserRole.POLICE,
      UserRole.PROSECUTOR,
      UserRole.JUDGE,
    ]);

    await ensureCaseOwnership(req.params.id, user);

    const updated = await updateCaseInternal(req.params.id, req.body);
    sendSuccess(res, updated);
  } catch (e) {
    next(e);
  }
};

export const deleteCase: ControllerHandler = async (req, res, next) => {
  try {
    const user = requireRole(req.user, [UserRole.POLICE, UserRole.JUDGE]);
    await ensureCaseOwnership(req.params.id, user);

    await Case.findByIdAndDelete(req.params.id);
    sendSuccess(res, null, 204);
  } catch (e) {
    next(e);
  }
};

export const getCase: ControllerHandler = async (req, res, next) => {
  try {
    const user = requireRole(req.user, [
      UserRole.POLICE,
      UserRole.PROSECUTOR,
      UserRole.JUDGE,
      UserRole.LAWYER,
    ]);

    const caseDoc = await ensureCaseOwnership(req.params.id, user);
    sendSuccess(res, caseDoc);
  } catch (e) {
    next(e);
  }
};

export const listCases: ControllerHandler = async (req, res, next) => {
  try {
    const user = requireRole(req.user, [
      UserRole.POLICE,
      UserRole.PROSECUTOR,
      UserRole.JUDGE,
      UserRole.LAWYER,
    ]);

    const page = Math.max(Number(req.query.page) || 1, 1);
    const pageSize = Math.min(Number(req.query.pageSize) || 10, 100);

    const query = {
      [UserRole.POLICE]: { policeId: user.userId },
      [UserRole.PROSECUTOR]: { prosecutorIds: user.userId },
      [UserRole.JUDGE]: { judgeIds: user.userId },
      [UserRole.LAWYER]: { lawyerIds: user.userId },
    }[user.role];

    const [items, total] = await Promise.all([
      Case.find(query)
        .skip((page - 1) * pageSize)
        .limit(pageSize)
        .sort({ createdAt: -1 }),
      Case.countDocuments(query),
    ]);

    sendSuccess(res, { items, page, pageSize, total });
  } catch (e) {
    next(e);
  }
};

export const moveCaseNextStage: ControllerHandler = async (req, res, next) => {
  try {
    const user = requireRole(req.user, [
      UserRole.POLICE,
      UserRole.PROSECUTOR,
      UserRole.JUDGE,
    ]);

    const payload = req.body as MoveCaseNextStageBody;

    const result = await moveCaseToNextStageInternal(
      req.params.id,
      user.role,
      user.userId,
      payload.operatorAddress ?? user.walletAddress,
      payload.targetStatus,
      payload.comment
    );

    await notificationUtils.createNotificationsForCaseParticipants(result.case, {
      senderId: user.userId,
      type: NotificationType.CASE_STATUS_CHANGED,
      title: '案件状态更新',
      content: `案件状态变更为 ${result.case.status}`,
      priority:
        result.case.status === CaseStatus.CLOSED
          ? NotificationPriority.URGENT
          : NotificationPriority.HIGH,
      relatedCaseId: result.case._id.toString(),
    });

    sendSuccess(res, result);
  } catch (e) {
    next(e);
  }
};

export const getCaseTimeline: ControllerHandler = async (req, res, next) => {
  try {
    await ensureCaseOwnership(req.params.id, req.user);

    const timeline = await CaseTimeline.find({
      caseId: req.params.id,
    })
      .sort({ timestamp: 1 })
      .populate('operatorId', 'name email role');

    sendSuccess(res, timeline);
  } catch (e) {
    next(e);
  }
};
