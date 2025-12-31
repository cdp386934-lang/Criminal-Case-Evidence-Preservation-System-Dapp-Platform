// 质证意见控制器
import { NextFunction, Response } from 'express';
import crypto from 'crypto';
import { AuthRequest, AuthenticatedUserPayload } from '../middleware/auth';
import { UserRole } from '../models/users.model';
import Case, { ICase } from '../models/case.model';
import Evidence from '../models/evidence.model';
import Objection, { IObjection, ObjectionStatus } from '../models/objection.model';
import OperationLog, { OperationType } from '../models/operation-logs.model';
import { requireRole } from '../types/rbac';
import { BadRequestError, ForbiddenError, NotFoundError } from '../utils/errors';
import { sendSuccess } from '../utils/response';
import * as notificationUtils from '../utils/notification';
import { NotificationType, NotificationPriority } from '../models/notification.model';

type ControllerHandler = (req: AuthRequest, res: Response, next: NextFunction) => Promise<void>;

/**
 * Case Service Helper Functions
 */
const getCaseById = async (caseId: string): Promise<ICase | null> => {
  return Case.findById(caseId)
    .populate('judgeIds')
    .populate('prosecutorIds')
    .populate('lawyerIds')
    .populate('policeId');
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
 * 提交质证意见（律师）
 * 权限：只有律师可以提交质证意见，且必须是案件的参与者
 */
export const submitObjection: ControllerHandler = async (req, res, next) => {
  try {
    const currentUser = requireRole(req.user, [UserRole.LAWYER]);
    const { caseId, evidenceId, content } = req.body;

    if (!caseId || !evidenceId || !content) {
      throw new BadRequestError('Missing required fields: caseId, evidenceId, content');
    }

    // 验证案件和证据
    const caseDoc = await Case.findById(caseId);
    if (!caseDoc) {
      throw new NotFoundError('Case not found');
    }

    const evidence = await Evidence.findById(evidenceId);
    if (!evidence) {
      throw new NotFoundError('Evidence not found');
    }

    // 验证权限：律师必须关联到该案件
    if (!caseDoc.lawyerIds?.some((id: any) => id.toString() === currentUser.userId)) {
      throw new ForbiddenError('Forbidden: Not assigned to this case');
    }

    // 验证证据属于该案件
    if (evidence.caseId.toString() !== caseId) {
      throw new BadRequestError('Evidence does not belong to this case');
    }

    const objectionId = crypto.randomUUID();

    const objection = new Objection({
      objectionId,
      caseId,
      evidenceId,
      lawyerId: currentUser.userId,
      content,
      status: ObjectionStatus.PENDING,
    });

    await objection.save();

    // 记录操作日志
    await OperationLog.create({
      userId: currentUser.userId,
      operationType: OperationType.OBJECTION_SUBMIT,
      targetType: 'objection',
      targetId: objection._id,
      description: `Submitted objection for evidence: ${evidence.evidenceId}`,
      ipAddress: req.ip,
      userAgent: req.get('user-agent'),
    });

    // 通知案件参与者有新的质证意见
    const caseDocPopulated = await getCaseById(caseId);
    if (caseDocPopulated) {
      await notificationUtils.createNotificationsForCaseParticipants(
        caseDocPopulated,
        {
          senderId: currentUser.userId,
          type: NotificationType.OBJECTION_SUBMITTED,
          title: '新质证意见已提交',
          content: `案件 ${caseDocPopulated.caseNumber} 中针对证据 ${evidence.evidenceId} 的质证意见已提交，请及时查看。`,
          priority: NotificationPriority.HIGH,
          relatedCaseId: caseId,
          relatedEvidenceId: evidenceId,
          relatedObjectionId: objection._id.toString(),
        }
      );
    }

    sendSuccess(res, objection, 201);
  } catch (error) {
    next(error);
  }
};

/**
 * 获取质证意见列表
 * 权限：案件的参与者可以查看，律师只能看到自己的质证意见
 */
export const listObjections: ControllerHandler = async (req, res, next) => {
  try {
    if (!req.user) {
      throw new ForbiddenError('Authentication required');
    }

    const { caseId, evidenceId, status } = req.query;

    let query: any = {};

    if (caseId) {
      // 验证权限
      const caseDoc = await Case.findById(caseId as string);
      if (!caseDoc) {
        throw new NotFoundError('Case not found');
      }

      const hasAccess = isCaseParticipant(caseDoc, req.user.userId, req.user.role);
      if (!hasAccess) {
        throw new ForbiddenError('Forbidden');
      }

      query.caseId = caseId;
    }

    if (evidenceId) query.evidenceId = evidenceId;
    if (status) query.status = status;

    // 律师只能看到自己的质证意见
    if (req.user.role === UserRole.LAWYER) {
      query.lawyerId = req.user.userId;
    }

    const objections = await Objection.find(query)
      .populate('caseId', 'caseNumber caseTitle')
      .populate('evidenceId', 'evidenceId title')
      .populate('lawyerId', 'name email role')
      .populate('handledBy', 'name email role')
      .sort({ createdAt: -1 });

    sendSuccess(res, objections);
  } catch (error) {
    next(error);
  }
};

/**
 * 获取质证意见详情
 * 权限：案件的参与者可以查看
 */
export const getObjection: ControllerHandler = async (req, res, next) => {
  try {
    if (!req.user) {
      throw new ForbiddenError('Authentication required');
    }

    const objection = await Objection.findById(req.params.id)
      .populate('caseId', 'caseNumber caseTitle')
      .populate('evidenceId', 'evidenceId title fileHash')
      .populate('lawyerId', 'name email role')
      .populate('handledBy', 'name email role');

    if (!objection) {
      throw new NotFoundError('Objection not found');
    }

    // 权限检查
    const caseDoc = await Case.findById(objection.caseId);
    if (!caseDoc) {
      throw new NotFoundError('Case not found');
    }

    const hasAccess = isCaseParticipant(caseDoc, req.user.userId, req.user.role);
    if (!hasAccess) {
      throw new ForbiddenError('Forbidden');
    }

    sendSuccess(res, objection);
  } catch (error) {
    next(error);
  }
};

/**
 * 处理质证意见（法官）
 * 权限：只有法官可以处理质证意见，且必须是案件的参与者
 */
export const handleObjection: ControllerHandler = async (req, res, next) => {
  try {
    const currentUser = requireRole(req.user, [UserRole.JUDGE]);
    const { isAccepted, handleResult } = req.body;

    if (typeof isAccepted !== 'boolean' || !handleResult) {
      throw new BadRequestError('Missing required fields: isAccepted (boolean), handleResult');
    }

    const objection = await Objection.findById(req.params.id);
    if (!objection) {
      throw new NotFoundError('Objection not found');
    }

    // 验证权限
    const caseDoc = await Case.findById(objection.caseId);
    if (!caseDoc) {
      throw new NotFoundError('Case not found');
    }

    if (!caseDoc.judgeIds?.some((id: any) => id.toString() === currentUser.userId)) {
      throw new ForbiddenError('Forbidden: Not assigned to this case');
    }

    objection.status = isAccepted ? ObjectionStatus.ACCEPTED : ObjectionStatus.REJECTED;
    objection.handledBy = currentUser.userId as any;
    objection.handledAt = new Date();
    objection.handleResult = handleResult;
    objection.isAccepted = isAccepted;

    await objection.save();

    // 记录操作日志
    await OperationLog.create({
      userId: currentUser.userId,
      operationType: OperationType.OBJECTION_HANDLE,
      targetType: 'objection',
      targetId: objection._id,
      description: `${isAccepted ? 'Accepted' : 'Rejected'} objection: ${objection.objectionId}`,
      ipAddress: req.ip,
      userAgent: req.get('user-agent'),
    });

    sendSuccess(res, objection);
  } catch (error) {
    next(error);
  }
};

