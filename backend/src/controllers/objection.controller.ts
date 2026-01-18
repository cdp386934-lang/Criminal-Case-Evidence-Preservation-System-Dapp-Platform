// 质证意见控制器
import { NextFunction, Response } from 'express';
import crypto from 'crypto';
import { AuthRequest, AuthenticatedUserPayload } from '../middleware/auth';
import { UserRole } from '../models/users.model';
import Case, { ICase } from '../models/case.model';
import Evidence from '../models/evidence.model';
import Objection, { IObjection, ObjectionStatus } from '../models/objection.model';
import {
  OperationType,
  OperationTargetType,
} from '../models/operation-logs.model';
import { requireRole } from '../middleware/rbac';
import { BadRequestError, ForbiddenError, NotFoundError } from '../utils/errors';
import { sendSuccess } from '../utils/response';
import * as notificationUtils from '../utils/notification';
import { NotificationType, NotificationPriority } from '../models/notification.model';
import { getCaseById } from '../services/case.service';
import { isCaseParticipant } from '../services/case.helper.service';
import { recordOperation } from './operation-logs.controller';

type ControllerHandler = (req: AuthRequest, res: Response, next: NextFunction) => Promise<void>;

/**
 * 提交质证意见（律师或检察官）
 * 权限：
 * - 民事诉讼（PROCURATORATE阶段）：原被告律师可以互相质证
 * - 公诉案件（PROCURATORATE阶段）：lawyer和procurator可以互相质证
 */
export const submitObjection: ControllerHandler = async (req, res, next) => {
  try {
    // 允许律师和检察官提交质证意见
    const currentUser = requireRole(req.user, [UserRole.LAWYER, UserRole.PROSECUTOR]);
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

    // 验证案件状态：只能在PROCURATORATE阶段进行质证
    if (caseDoc.status !== 'PROCURATORATE') {
      throw new ForbiddenError('Objections can only be submitted during prosecution stage');
    }

    // 验证权限：用户必须是案件的参与者
    const hasAccess = isCaseParticipant(caseDoc, currentUser);
    if (!hasAccess) {
      throw new ForbiddenError('Forbidden: Not assigned to this case');
    }

    // 根据案件类型验证权限
    if (caseDoc.caseType === 'CIVIL_LITIGATION') {
      // 民事诉讼：只有律师可以质证
      if (currentUser.role !== UserRole.LAWYER) {
        throw new ForbiddenError('Only lawyers can submit objections for civil litigation cases');
      }
    } else if (caseDoc.caseType === 'PUBLIC_PROSECUTION') {
      // 公诉案件：律师和检察官都可以质证
      if (![UserRole.LAWYER, UserRole.PROSECUTOR].includes(currentUser.role)) {
        throw new ForbiddenError('Only lawyers and prosecutors can submit objections for public prosecution cases');
      }
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
    await recordOperation({
      req,
      operationType: OperationType.SUBMIT,
      targetType: OperationTargetType.OBJECTION,
      targetId: objection._id.toString(),
      description: `Submitted objection for evidence: ${evidence.evidenceId}`,
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

    // 分页参数
    const { caseId, evidenceId, status, keyword, page = '1', pageSize = '20' } = req.query;
    const pageNum = Math.max(1, parseInt(page as string, 10));
    const pageSizeNum = Math.min(100, Math.max(1, parseInt(pageSize as string, 10)));

    let query: any = {};

    if (caseId) {
      // 验证权限
      const caseDoc = await Case.findById(caseId as string);
      if (!caseDoc) {
        throw new NotFoundError('Case not found');
      }

      const hasAccess = isCaseParticipant(caseDoc, req.user);
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

    // 模糊搜索：质证内容
    if (keyword) {
      query.content = { $regex: keyword as string, $options: 'i' };
    }

    // 计算总数和查询数据
    const total = await Objection.countDocuments(query);
    const objections = await Objection.find(query)
      .populate('caseId', 'caseNumber caseTitle')
      .populate('evidenceId', 'evidenceId title')
      .populate('lawyerId', 'name email role')
      .populate('handledBy', 'name email role')
      .sort({ createdAt: -1 })
      .skip((pageNum - 1) * pageSizeNum)
      .limit(pageSizeNum);

    sendSuccess(res, {
      items: objections,
      page: pageNum,
      pageSize: pageSizeNum,
      total,
      totalPages: Math.ceil(total / pageSizeNum),
    });
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

    const hasAccess = isCaseParticipant(caseDoc, req.user);
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

    if (!(caseDoc.judgeId?.toString() === currentUser.userId)) {
      throw new ForbiddenError('Forbidden: Not assigned to this case');
    }

    objection.status = isAccepted ? ObjectionStatus.ACCEPTED : ObjectionStatus.REJECTED;
    objection.handledBy = currentUser.userId as any;
    objection.handledAt = new Date();
    objection.handleResult = handleResult;
    objection.isAccepted = isAccepted;

    await objection.save();

    // 记录操作日志
    await recordOperation({
      req,
      operationType: OperationType.HANDLE,
      targetType: OperationTargetType.OBJECTION,
      targetId: objection._id.toString(),
      description: `${isAccepted ? 'Accepted' : 'Rejected'} objection: ${objection.objectionId}`,
    });

    sendSuccess(res, objection);
  } catch (error) {
    next(error);
  }
};

