import { NextFunction, Response } from 'express';
import mongoose from 'mongoose';
import { AuthRequest, AuthenticatedUserPayload } from '../middleware/auth';
import { UserRole } from '../models/users.model';
import { AddCaseBody, CaseStatus, MoveCaseNextStageBody, UpdateCaseDTO, CreateCaseDTO, ICase } from '../models/case.model';
import Case from '../models/case.model';
import CaseTimeline, { ICaseTimeline } from '../models/case-timeline.model';
import { requireRole } from '../types/rbac';
import { BadRequestError, ForbiddenError, NotFoundError } from '../utils/errors';
import { sendSuccess } from '../utils/response';
import * as notificationUtils from '../utils/notification';
import { NotificationType, NotificationPriority } from '../models/notification.model';

type ControllerHandler = (req: AuthRequest, res: Response, next: NextFunction) => Promise<void>;

/**
 * 案件状态流转映射
 * 定义每个角色可以执行的状态转换
 */
const WORKFLOW_TRANSITIONS: Partial<Record<CaseStatus, Partial<Record<UserRole, CaseStatus[]>>>> = {
  [CaseStatus.INVESTIGATION]: {
    [UserRole.POLICE]: [
      CaseStatus.PROCURATORATE,
      CaseStatus.COURT_TRIAL,
      CaseStatus.CLOSED,
    ],
    [UserRole.PROSECUTOR]: [],
    [UserRole.JUDGE]: [],
    [UserRole.LAWYER]: [],
  },
  [CaseStatus.PROCURATORATE]: {
    [UserRole.POLICE]: [],
    [UserRole.PROSECUTOR]: [CaseStatus.COURT_TRIAL, CaseStatus.INVESTIGATION],
    [UserRole.JUDGE]: [CaseStatus.COURT_TRIAL],
    [UserRole.LAWYER]: [],
  },
  [CaseStatus.COURT_TRIAL]: {
    [UserRole.POLICE]: [],
    [UserRole.PROSECUTOR]: [],
    [UserRole.JUDGE]: [CaseStatus.CLOSED],
    [UserRole.LAWYER]: [],
  },
  [CaseStatus.CLOSED]: {
    [UserRole.POLICE]: [],
    [UserRole.PROSECUTOR]: [],
    [UserRole.JUDGE]: [],
    [UserRole.LAWYER]: [],
  },
};

/**
 * 获取下一个状态（自动推断）
 */
const getNextStatus = (currentStatus: CaseStatus, role: UserRole): CaseStatus | null => {
  const transitions = WORKFLOW_TRANSITIONS[currentStatus]?.[role];
  if (!transitions || transitions.length === 0) {
    return null;
  }
  return transitions[0];
};

/**
 * 验证角色是否可以执行状态转换
 */
const canTransition = (
  currentStatus: CaseStatus,
  targetStatus: CaseStatus,
  role: UserRole
): boolean => {
  const allowedTransitions = WORKFLOW_TRANSITIONS[currentStatus]?.[role];
  if (!allowedTransitions) {
    return false;
  }
  return allowedTransitions.includes(targetStatus);
};

/**
 * 验证用户是否有权限操作案件
 */
const verifyCaseAccess = async (
  caseDocument: ICase,
  userId: string,
  role: UserRole
): Promise<boolean> => {
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
 * Case Service Functions
 */
const getCaseById = async (caseId: string): Promise<ICase | null> => {
  return Case.findById(caseId)
    .populate('policeId', 'name email role')
    .populate('prosecutorIds', 'name email role')
    .populate('judgeIds', 'name email role')
    .populate('lawyerIds', 'name email role');
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

const createCase = async (payload: CreateCaseDTO & { policeId?: string }): Promise<ICase> => {
  const caseData: any = {
    caseNumber: payload.caseNumber,
    caseTitle: payload.caseTitle,
    caseType: payload.caseType,
    description: payload.description,
    plaintiffMessage: payload.plaintiffMessage,
    defendantMessage: payload.defendantMessage,
    status: payload.status || CaseStatus.INVESTIGATION,
  };

  if (payload.policeId) {
    caseData.policeId = new mongoose.Types.ObjectId(payload.policeId);
  }

  if (payload.prosecutorIds && payload.prosecutorIds.length > 0) {
    caseData.prosecutorIds = payload.prosecutorIds.map(id => new mongoose.Types.ObjectId(id));
  }

  if (payload.judgeIds && payload.judgeIds.length > 0) {
    caseData.judgeIds = payload.judgeIds.map(id => new mongoose.Types.ObjectId(id));
  }

  if (payload.lawyerIds && payload.lawyerIds.length > 0) {
    caseData.lawyerIds = payload.lawyerIds.map(id => new mongoose.Types.ObjectId(id));
  }

  const newCase = new Case(caseData);
  return newCase.save();
};

const updateCaseInternal = async (caseId: string, updates: UpdateCaseDTO): Promise<ICase> => {
  const updateData: any = {};

  if (updates.caseTitle) updateData.caseTitle = updates.caseTitle;
  if (updates.caseType) updateData.caseType = updates.caseType;
  if (updates.description !== undefined) updateData.description = updates.description;
  if (updates.status) updateData.status = updates.status;

  if (updates.judgeIds) {
    updateData.judgeIds = updates.judgeIds.map(id => new mongoose.Types.ObjectId(id));
  }

  if (updates.lawyerIds) {
    updateData.lawyerIds = updates.lawyerIds.map(id => new mongoose.Types.ObjectId(id));
  }

  const updated = await Case.findByIdAndUpdate(caseId, updateData, { new: true });
  if (!updated) {
    throw new NotFoundError('Case not found');
  }
  return updated;
};

const deleteCaseInternal = async (caseId: string): Promise<void> => {
  const deleted = await Case.findByIdAndDelete(caseId);
  if (!deleted) {
    throw new NotFoundError('Case not found');
  }
};

const listCasesInternal = async (): Promise<ICase[]> => {
  return Case.find()
    .populate('policeId', 'name email role')
    .populate('prosecutorIds', 'name email role')
    .populate('judgeIds', 'name email role')
    .populate('lawyerIds', 'name email role')
    .sort({ createdAt: -1 });
};

/**
 * Case Workflow Service Functions
 */
const recordCaseTimeline = async (
  caseId: string,
  stage: CaseStatus,
  operatorRole: UserRole,
  operatorId: string,
  operatorAddress?: string,
  comment?: string
): Promise<ICaseTimeline> => {
  const caseDocument = await Case.findById(caseId);
  if (!caseDocument) {
    throw new NotFoundError('Case not found');
  }

  const timeline = new CaseTimeline({
    caseId: new mongoose.Types.ObjectId(caseId),
    stage,
    operatorRole,
    operatorId: new mongoose.Types.ObjectId(operatorId),
    operatorAddress,
    comment,
    timestamp: new Date(),
  });

  await timeline.save();
  return timeline;
};

const moveCaseToNextStage = async (
  caseId: string,
  actionUserRole: UserRole,
  actionUserId: string,
  operatorAddress?: string,
  targetStatus?: CaseStatus,
  comment?: string
): Promise<{ case: ICase; timeline: ICaseTimeline }> => {
  const caseDocument = await Case.findById(caseId);
  if (!caseDocument) {
    throw new NotFoundError('Case not found');
  }

  if (caseDocument.status === CaseStatus.CLOSED) {
    throw new BadRequestError('Case is closed and cannot be updated');
  }

  const hasAccess = await verifyCaseAccess(caseDocument, actionUserId, actionUserRole);
  if (!hasAccess) {
    throw new ForbiddenError('You are not authorized to operate this case');
  }

  const currentStatus = caseDocument.status;
  const nextStatus = targetStatus || getNextStatus(currentStatus, actionUserRole);

  if (!nextStatus) {
    throw new BadRequestError(
      `Role ${actionUserRole} cannot transition from ${currentStatus}`
    );
  }

  if (targetStatus && !canTransition(currentStatus, targetStatus, actionUserRole)) {
    throw new BadRequestError(
      `Role ${actionUserRole} cannot transition from ${currentStatus} to ${targetStatus}`
    );
  }

  caseDocument.status = nextStatus;
  await caseDocument.save();

  const timeline = new CaseTimeline({
    caseId: new mongoose.Types.ObjectId(caseId),
    stage: nextStatus,
    operatorRole: actionUserRole,
    operatorId: new mongoose.Types.ObjectId(actionUserId),
    operatorAddress: operatorAddress,
    comment: comment,
    timestamp: new Date(),
  });

  await timeline.save();

  return { case: caseDocument, timeline };
};

const getCaseTimelineInternal = async (caseId: string): Promise<ICaseTimeline[]> => {
  const caseDocument = await Case.findById(caseId);
  if (!caseDocument) {
    throw new NotFoundError('Case not found');
  }

  return CaseTimeline.find({ caseId: new mongoose.Types.ObjectId(caseId) })
    .sort({ timestamp: 1 })
    .populate('operatorId', 'name email role');
};

const ensureCaseOwnership = async (caseId: string, user?: AuthenticatedUserPayload) => {
  const caseDocument = await getCaseById(caseId);
  if (!caseDocument) {
    throw new NotFoundError('Case not found');
  }

  if (!user) {
    throw new ForbiddenError('Authentication required');
  }

  const isParticipant = isCaseParticipant(caseDocument, user.userId, user.role);
  if (!isParticipant) {
    throw new ForbiddenError('You are not assigned to this case');
  }
  return caseDocument;
};

/**
 * 创建案件（公安立案）
 * 权限：只有公安（POLICE）可以立案
 * 注意：立案时 prosecutorId、judgeIds、lawyerIds 可能为空，后续阶段再分配
 * @param req 请求对象，包含案件数据和当前用户信息
 * @param res 响应对象
 * @param next 错误处理中间件
 */
export const addCase: ControllerHandler = async (req, res, next) => {
  try {
    // 验证用户角色：只有公安可以立案
    const currentUser = requireRole(req.user, [UserRole.POLICE]);
    const payload = req.body as AddCaseBody;

    // 验证必填字段
    if (!payload.caseNumber || !payload.caseTitle || !payload.caseType) {
      throw new BadRequestError('Missing required case fields: caseNumber, caseTitle, caseType');
    }

    // 处理 judgeIds 和 lawyerIds：确保它们是数组格式
    // 前端可能传递字符串数组或逗号分隔的字符串，这里统一转换为数组
    const prosecutorIds = Array.isArray(payload.prosecutorIds) ? payload.prosecutorIds : [];
    const judgeIds = Array.isArray(payload.judgeIds) ? payload.judgeIds : [];
    const lawyerIds = Array.isArray(payload.lawyerIds) ? payload.lawyerIds : [];

    // 创建案件
    const created = await createCase({
      caseNumber: payload.caseNumber,
      caseTitle: payload.caseTitle,
      caseType: payload.caseType,
      description: payload.description,
      plaintiffMessage: payload.plaintiffMessage,
      defendantMessage: payload.defendantMessage,
      prosecutorIds: payload.prosecutorIds || [],
      judgeIds,
      lawyerIds,
      status: CaseStatus.INVESTIGATION,
      policeId: currentUser.userId,
    });

    // 创建时间线记录（记录立案动作，状态为 INVESTIGATION）
    await recordCaseTimeline(
      created._id.toString(),
      CaseStatus.INVESTIGATION,
      UserRole.POLICE,
      currentUser.userId,
      req.user?.walletAddress,
      '侦察中'
    );

    // 自动推送通知给案件参与者
    await notificationUtils.createNotificationsForCaseParticipants(
      created,
      {
        senderId: currentUser.userId,
        type: NotificationType.CASE_CREATED,
        title: '新案件已创建',
        content: `案件 ${created.caseNumber}（${created.caseTitle}）已创建，请及时查看。`,
        priority: NotificationPriority.HIGH,
        relatedCaseId: created._id.toString(),
      }
    );

    sendSuccess(res, created, 201);
  } catch (error) {
    next(error);
  }
};

/**
 * 更新案件（法官、公安机关、检察官可访问）
 * 权限：法官、检察官可以更新案件
 * @param req 请求对象，包含案件ID和更新数据
 * @param res 响应对象
 * @param next 错误处理中间件
 */
export const updateCase: ControllerHandler = async (req, res, next) => {
  try {
    // 验证用户角色：法官、公安机关、检察官可以更新案件
    const currentUser = requireRole(req.user, [UserRole.JUDGE, UserRole.POLICE, UserRole.PROSECUTOR]);

    const caseDocument = await ensureCaseOwnership(req.params.id, currentUser);

    // 验证是否被分配到此案件（法官/检察官都需要是参与者，ensureCaseOwnership 已经校验）

    const updates = req.body as UpdateCaseDTO;
    const updated = await updateCaseInternal(req.params.id, updates);
    sendSuccess(res, updated);
  } catch (error) {
    next(error);
  }
};

/**
 * 删除案件（公安、法官可访问）
 * 权限：公安、法官可以删除案件
 * @param req 请求对象，包含案件ID
 * @param res 响应对象
 * @param next 错误处理中间件
 */
export const deleteCase: ControllerHandler = async (req, res, next) => {
  try {
    // 验证用户角色：公安、法官可以删除案件
    const currentUser = requireRole(req.user, [UserRole.POLICE, UserRole.JUDGE]);

    const caseDocument = await ensureCaseOwnership(req.params.id, currentUser);

    await deleteCaseInternal(req.params.id);
    sendSuccess(res, null, 204);
  } catch (error) {
    next(error);
  }
};

/**
 * 获取案件详情（法官、检察官、律师、公安可访问）
 * 权限：各角色都可以查看案件，但只能查看自己被分配的案件
 * @param req 请求对象，包含案件ID
 * @param res 响应对象
 * @param next 错误处理中间件
 */
export const getCase: ControllerHandler = async (req, res, next) => {
  try {
    // 只有公安、法官、检察官、律师可以查看案件详情
    const currentUser = requireRole(req.user, [
      UserRole.POLICE,
      UserRole.JUDGE,
      UserRole.PROSECUTOR,
      UserRole.LAWYER,
    ]);

    const caseDocument = await ensureCaseOwnership(req.params.id, currentUser);

    sendSuccess(res, caseDocument);
  } catch (error) {
    next(error);
  }
};

/**
 * 获取案件列表（法官、检察官、律师、公安可访问）
 * 权限：各角色都可以查看案件列表，但只能查看自己被分配的案件
 * @param req 请求对象
 * @param res 响应对象
 * @param next 错误处理中间件
 */
export const listCases: ControllerHandler = async (req, res, next) => {
  try {
    // 只有公安、法官、检察官、律师可以查看案件列表
    const currentUser = requireRole(req.user, [
      UserRole.POLICE,
      UserRole.JUDGE,
      UserRole.PROSECUTOR,
      UserRole.LAWYER,
    ]);

    // 分页参数
    const page = Math.max(parseInt((req.query.page as string) || '1', 10), 1);
    const pageSize = Math.min(
      Math.max(parseInt((req.query.pageSize as string) || '10', 10), 1),
      100
    );

    // 获取所有案件
    const cases = await listCasesInternal();

    // 过滤：只返回当前用户被分配的案件
    const participantCases = cases.filter((caseDocument) =>
      isCaseParticipant(caseDocument, currentUser.userId, currentUser.role)
    );

    const total = participantCases.length;
    const start = (page - 1) * pageSize;
    const items = participantCases.slice(start, start + pageSize);

    sendSuccess(res, {
      items,
      page,
      pageSize,
      total,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * 推进案件到下一阶段
 * 权限：根据案件当前状态和用户角色，只有特定角色可以推进
 * @param req 请求对象，包含案件ID和推进参数
 * @param res 响应对象
 * @param next 错误处理中间件
 */
export const moveCaseNextStage: ControllerHandler = async (req, res, next) => {
  try {
    const currentUser = requireRole(req.user, [
      UserRole.POLICE,
      UserRole.PROSECUTOR,
      UserRole.JUDGE,
    ]);
    const caseId = req.params.id;
    const payload = req.body as MoveCaseNextStageBody;

    // 推进案件状态
    const result = await moveCaseToNextStage(
      caseId,
      currentUser.role,
      currentUser.userId,
      payload.operatorAddress || currentUser.walletAddress,
      payload.targetStatus,
      payload.comment
    );

    // 根据新状态推送通知
    let notificationType = NotificationType.CASE_STATUS_CHANGED;
    let notificationTitle = '案件状态已更新';
    let notificationContent = `案件 ${result.case.caseNumber} 状态已更新为：${result.case.status}`;

    if (result.case.status === CaseStatus.CLOSED) {
      notificationType = NotificationType.CASE_CLOSED;
      notificationTitle = '案件已结案';
      notificationContent = `案件 ${result.case.caseNumber}（${result.case.caseTitle}）已结案。`;
    } else if (result.case.status === CaseStatus.PROCURATORATE) {
      notificationType = NotificationType.CASE_SUBMITTED;
      notificationTitle = '案件已提交';
      notificationContent = `案件 ${result.case.caseNumber} 已提交至检察院。`;
    }

    // 推送通知给案件参与者
    await notificationUtils.createNotificationsForCaseParticipants(
      result.case,
      {
        senderId: currentUser.userId,
        type: notificationType,
        title: notificationTitle,
        content: notificationContent,
        priority: result.case.status === CaseStatus.CLOSED 
          ? NotificationPriority.URGENT 
          : NotificationPriority.HIGH,
        relatedCaseId: result.case._id.toString(),
      }
    );

    sendSuccess(res, {
      case: result.case,
      timeline: result.timeline,
      message: '案件状态已更新',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * 获取案件时间线（案件流程进度）
 * 权限：案件的参与者都可以查看时间线
 * @param req 请求对象，包含案件ID
 * @param res 响应对象
 * @param next 错误处理中间件
 */
export const getCaseTimeline: ControllerHandler = async (req, res, next) => {
  try {
    const caseId = req.params.id;

    await ensureCaseOwnership(caseId, req.user);

    // 获取时间线
    const timeline = await getCaseTimelineInternal(caseId);

    sendSuccess(res, timeline);
  } catch (error) {
    next(error);
  }
};


