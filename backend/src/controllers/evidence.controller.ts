// 证据控制器
import { NextFunction, Response } from 'express';
import { AuthRequest, AuthenticatedUserPayload } from '../middleware/auth';
import { UserRole } from '../models/users.model';
import { CaseStatus } from '../models/case.model';
import { requireRole } from '../middleware/rbac';
import { BadRequestError, ForbiddenError, NotFoundError } from '../utils/errors';
import { sendSuccess } from '../utils/response';
import * as notificationUtils from '../utils/notification';
import { NotificationType, NotificationPriority } from '../models/notification.model';
import { getCaseById } from '../services/case.service';
import { isCaseParticipant } from '../services/case.helper.service';
import {
  createEvidence,
  deleteEvidenceInternal,
  getEvidenceById,
  listEvidenceByCaseInternal,
  updateEvidenceInternal,
} from '../services/evidence.service';
import { CreateEvidenceDTO, UpdateEvidenceDTO } from '../dto/evidence.dto';
import {
  OperationType,
  OperationTargetType,
} from '../models/operation-logs.model';
import { recordOperation } from './operation-logs.controller';

interface AddEvidenceBody {
  caseId: string;
  title: string;
  description?: string;
  fileHash: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  evidenceType: string;
}

type ControllerHandler = (req: AuthRequest, res: Response, next: NextFunction) => Promise<void>;

type EvidenceAction = 'view' | 'upload' | 'modify';

// 公安证据阶段：根据流程文档，只能在侦查阶段上传证据
const POLICE_EVIDENCE_STAGES = new Set<CaseStatus>([CaseStatus.INVESTIGATION]);

// 检察官上传证据阶段：仅在“移送审查起诉”阶段允许
const PROSECUTOR_UPLOAD_STAGES = new Set<CaseStatus>([CaseStatus.PROSECUTORATE, CaseStatus.COURT_TRIAL]);

const JUDGE_UPLOAD_STAGES = new Set<CaseStatus>([CaseStatus.COURT_TRIAL]);

// 律师视图/上传阶段：流程文档要求律师在任何阶段都可以上传证据，
// 因此只要是案件参与律师，在任意案件阶段都可以查看/上传证据
const LAWYER_VIEW_STAGES = new Set<CaseStatus>([
  CaseStatus.INVESTIGATION,
  CaseStatus.PROSECUTORATE,
  CaseStatus.COURT_TRIAL,
]);

const ensureCaseAccess = async (
  caseId: string,
  user: AuthenticatedUserPayload | undefined,
  action: EvidenceAction
) => {
  const caseDoc = await getCaseById(caseId);
  if (!caseDoc) {
    throw new NotFoundError('Case not found');
  }

  if (!user) {
    throw new ForbiddenError('Authentication required');
  }

  const hasAccess = isCaseParticipant(caseDoc, user);
  if (!hasAccess) {
    throw new ForbiddenError('You are not assigned to this case');
  }

  // 禁止在判决/结案后修改或新增证据
  if (action !== 'view' && [CaseStatus.CLOSED].includes(caseDoc.status)) {
    throw new ForbiddenError('Case is already adjudicated and evidence cannot be changed');
  }

  if (user.role === UserRole.POLICE) {
    if (!POLICE_EVIDENCE_STAGES.has(caseDoc.status)) {
      throw new ForbiddenError('Police cannot access evidence after the case is transferred');
    }
  }

  if (user.role === UserRole.PROSECUTOR) {
    if (action !== 'view' && !PROSECUTOR_UPLOAD_STAGES.has(caseDoc.status)) {
      throw new ForbiddenError('Prosecutors can only submit evidence during review or prosecution stages');
    }
  }

  if (user.role === UserRole.JUDGE) {
    if (![CaseStatus.COURT_TRIAL, CaseStatus.CLOSED].includes(caseDoc.status)) {
      throw new ForbiddenError('Judges can only access evidence for prosecuted cases');
    }
    if (action !== 'view' && !JUDGE_UPLOAD_STAGES.has(caseDoc.status)) {
      throw new ForbiddenError('Judges can only add evidence during court trial');
    }
  }

  if (user.role === UserRole.LAWYER) {
    if (!LAWYER_VIEW_STAGES.has(caseDoc.status)) {
      throw new ForbiddenError('Lawyers can only access evidence for valid case stages');
    }
  }

  return caseDoc;
};

/**
 * 上传证据（公安侦查、检察官审查/起诉、法官庭审、律师庭审）
 * 权限：不同角色需满足各自阶段限制
 * @param req 请求对象，包含证据数据和当前用户信息
 * @param res 响应对象
 * @param next 错误处理中间件
 */
export const addEvidence: ControllerHandler = async (req, res, next) => {
  try {
    // 验证用户角色
    const currentUser = requireRole(req.user, [
      UserRole.PROSECUTOR,
      UserRole.LAWYER,
      UserRole.JUDGE,
      UserRole.POLICE,
    ]);
    const payload = req.body as AddEvidenceBody;

    // 验证必填字段
    if (
      !payload.caseId ||
      !payload.title ||
      !payload.fileHash ||
      !payload.fileName ||
      !payload.fileType ||
      !payload.evidenceType ||
      typeof payload.fileSize === 'undefined'
    ) {
      throw new BadRequestError('Missing required evidence fields');
    }

    // 验证案件权限与阶段
    const caseDoc = await ensureCaseAccess(payload.caseId, currentUser, 'upload');

    // 在INVESTIGATION阶段，如果lawyer上传证据，状态设为pending，需要police验证
    let initialStatus = 'pending';
    if (caseDoc.status === CaseStatus.INVESTIGATION && currentUser.role === UserRole.LAWYER) {
      initialStatus = 'pending'; // lawyer上传的证据需要police验证
    } else if (currentUser.role === UserRole.POLICE) {
      initialStatus = 'approved'; // police上传的证据直接通过
    }

    // 创建证据
    const createdEvidence = await createEvidence({
      caseId: payload.caseId,
      uploaderId: currentUser.userId,
      title: payload.title,
      description: payload.description,
      fileHash: payload.fileHash,
      fileName: payload.fileName,
      fileType: payload.fileType,
      fileSize: Number(payload.fileSize),
      evidenceType: payload.evidenceType as CreateEvidenceDTO['evidenceType'],
      status: initialStatus as any,
    });

    // 自动推送通知给案件参与者（排除上传者自己）
    await notificationUtils.createNotificationsForCaseParticipants(
      caseDoc,
      {
        senderId: currentUser.userId,
        type: NotificationType.EVIDENCE_UPLOADED,
        title: '新证据已上传',
        content: `案件 ${caseDoc.caseNumber} 中已上传新证据：${createdEvidence.title}，请及时查看。`,
        priority: NotificationPriority.HIGH,
        relatedCaseId: caseDoc._id.toString(),
        relatedEvidenceId: createdEvidence._id.toString(),
      }
    );

    await recordOperation({
      req,
      operationType: OperationType.CREATE,
      targetType: OperationTargetType.EVIDENCE,
      targetId: createdEvidence._id.toString(),
      description: `Uploaded evidence ${createdEvidence.evidenceId} for case ${caseDoc.caseNumber}`,
    });

    sendSuccess(res, createdEvidence, 201);
  } catch (error) {
    next(error);
  }
};

/**
 * 更新证据（律师、检察官、公安可访问，且只能更新自己上传的证据）
 * 权限：只有上传者可以更新，公安仅限侦查阶段
 * @param req 请求对象，包含证据ID和更新数据
 * @param res 响应对象
 * @param next 错误处理中间件
 */
export const updateEvidence: ControllerHandler = async (req, res, next) => {
  try {
    // 验证用户角色
    const currentUser = requireRole(req.user, [UserRole.PROSECUTOR, UserRole.LAWYER, UserRole.POLICE, UserRole.JUDGE]);

    // 检查证据是否存在
    const evidence = await getEvidenceById(req.params.id);
    if (!evidence) {
      throw new NotFoundError('Evidence not found');
    }

    // 验证用户是否是案件的参与者及阶段限制
    const caseDoc = await ensureCaseAccess(evidence.caseId.toString(), currentUser, 'modify');

    // 验证是否是证据的上传者：只有上传者可以更新自己上传的证据
    if (evidence.uploaderId.toString() !== currentUser.userId) {
      throw new ForbiddenError('Only the uploader can update this evidence');
    }

    const updates = req.body as UpdateEvidenceDTO;
    const updated = await updateEvidenceInternal(req.params.id, updates);

    await recordOperation({
      req,
      operationType: OperationType.UPDATE,
      targetType: OperationTargetType.EVIDENCE,
      targetId: updated._id.toString(),
      description: `Updated evidence ${updated.evidenceId}`,
    });

    sendSuccess(res, updated);
  } catch (error) {
    next(error);
  }
};

/**
 * 删除证据（律师、检察官、公安可访问，且只能删除自己上传的证据）
 * 权限：只有上传者可以删除，公安仅限侦查阶段
 * @param req 请求对象，包含证据ID
 * @param res 响应对象
 * @param next 错误处理中间件
 */
export const deleteEvidence: ControllerHandler = async (req, res, next) => {
  try {
    // 验证用户角色
    const currentUser = requireRole(req.user, [UserRole.PROSECUTOR, UserRole.LAWYER, UserRole.POLICE]);

    // 检查证据是否存在
    const evidence = await getEvidenceById(req.params.id);
    if (!evidence) {
      throw new NotFoundError('Evidence not found');
    }

    // 验证用户是否是案件的参与者及阶段限制
    const caseDoc = await ensureCaseAccess(evidence.caseId.toString(), currentUser, 'modify');

    // 验证是否是证据的上传者：只有上传者可以删除自己上传的证据
    if (evidence.uploaderId.toString() !== currentUser.userId) {
      throw new ForbiddenError('Only the uploader can delete this evidence');
    }

    await deleteEvidenceInternal(req.params.id);

    await recordOperation({
      req,
      operationType: OperationType.DELETE,
      targetType: OperationTargetType.EVIDENCE,
      targetId: evidence._id.toString(),
      description: `Deleted evidence ${evidence.evidenceId}`,
    });

    sendSuccess(res, null, 204);
  } catch (error) {
    next(error);
  }
};

/**
 * 获取证据详情（公安、法官、检察官、律师可访问）
 * 权限：四个角色都可以查看，但需满足阶段限制
 * @param req 请求对象，包含证据ID
 * @param res 响应对象
 * @param next 错误处理中间件
 */
export const getEvidence: ControllerHandler = async (req, res, next) => {
  try {
    // 验证用户已登录（法官、检察官、律师都可以查看）
    if (!req.user) {
      throw new ForbiddenError('Authentication required');
    }

    // 检查证据是否存在
    const evidence = await getEvidenceById(req.params.id);
    if (!evidence) {
      throw new NotFoundError('Evidence not found');
    }

    // 验证用户是否是案件的参与者
    const caseDoc = await ensureCaseAccess(evidence.caseId.toString(), req.user, 'view');
    const user = req.user;
    const hasAccess = user && isCaseParticipant(caseDoc, user);
    if (!hasAccess) {
      throw new ForbiddenError('You are not assigned to this case, cannot view this evidence');
    }

    sendSuccess(res, evidence);
  } catch (error) {
    next(error);
  }
};

/**
 * 获取案件下的证据列表（公安、法官、检察官、律师可访问）
 * 权限：四个角色都可以查看证据列表，但需满足阶段限制
 * @param req 请求对象，包含案件ID、分页和搜索参数
 * @param res 响应对象
 * @param next 错误处理中间件
 */
export const listEvidenceByCase: ControllerHandler = async (req, res, next) => {
  try {
    // 验证用户已登录（法官、检察官、律师都可以查看）
    if (!req.user) {
      throw new ForbiddenError('Authentication required');
    }

    const caseId = req.params.caseId;
    const { page = '1', pageSize = '20', keyword, status, evidenceType } = req.query;
    const pageNum = Math.max(1, parseInt(page as string, 10));
    const pageSizeNum = Math.min(100, Math.max(1, parseInt(pageSize as string, 10)));

    // 验证用户是否是案件的参与者
    const caseDoc = await ensureCaseAccess(caseId, req.user, 'view');
    const user = req.user;
    const hasAccess = user && isCaseParticipant(caseDoc, user);
    if (!hasAccess) {
      throw new ForbiddenError('You are not assigned to this case, cannot view evidence list');
    }

    // 构建查询条件
    const query: any = { caseId };

    // 模糊搜索：标题、描述、文件名
    if (keyword) {
      query.$or = [
        { title: { $regex: keyword as string, $options: 'i' } },
        { description: { $regex: keyword as string, $options: 'i' } },
        { fileName: { $regex: keyword as string, $options: 'i' } },
      ];
    }

    // 状态筛选
    if (status) {
      query.status = status;
    }

    // 证据类型筛选
    if (evidenceType) {
      query.evidenceType = evidenceType;
    }

    // 计算总数和查询数据
    const Evidence = (await import('../models/evidence.model')).default;
    const total = await Evidence.countDocuments(query);
    const evidences = await Evidence.find(query)
      .populate('uploaderId', 'name email role')
      .populate('verifiedBy', 'name email')
      .sort({ createdAt: -1 })
      .skip((pageNum - 1) * pageSizeNum)
      .limit(pageSizeNum);

    sendSuccess(res, {
      items: evidences,
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
 * 验证证据（警察审批律师上传的证据）
 * 权限：仅在INVESTIGATION阶段，police可以审批lawyer上传的证据
 */
export const verifyEvidence: ControllerHandler = async (req, res, next) => {
  try {
    const currentUser = requireRole(req.user, [UserRole.POLICE]);
    const { status, reason } = req.body; // status: 'approved' | 'rejected'

    if (!['approved', 'rejected'].includes(status)) {
      throw new BadRequestError('Status must be "approved" or "rejected"');
    }

    const evidence = await getEvidenceById(req.params.id);
    if (!evidence) {
      throw new NotFoundError('Evidence not found');
    }

    const caseDoc = await getCaseById(evidence.caseId.toString());
    if (!caseDoc) {
      throw new NotFoundError('Case not found');
    }

    // 权限检查：仅在INVESTIGATION阶段可以验证
    if (caseDoc.status !== CaseStatus.INVESTIGATION) {
      throw new ForbiddenError('Evidence can only be verified during investigation stage');
    }

    // 只有police可以验证
    if (caseDoc.policeId?.toString() !== currentUser.userId) {
      throw new ForbiddenError('Only the assigned police can verify evidence');
    }

    // 获取上传者信息，确认是lawyer上传的
    const User = (await import('../models/users.model')).default;
    const uploader = await User.findById(evidence.uploaderId);
    if (!uploader || uploader.role !== UserRole.LAWYER) {
      throw new ForbiddenError('Only evidence uploaded by lawyers can be verified by police');
    }

    // 更新证据状态
    const updateData: any = {
      status: status === 'approved' ? 'approved' : 'rejected',
      verifiedBy: currentUser.userId,
      verifiedAt: new Date(),
    };
    if (reason) {
      updateData.correctionReason = reason;
    }

    const updated = await updateEvidenceInternal(req.params.id, updateData);

    await recordOperation({
      req,
      operationType: OperationType.UPDATE,
      targetType: OperationTargetType.EVIDENCE,
      targetId: updated._id.toString(),
      description: `Verified evidence ${updated.evidenceId} as ${status}`,
    });

    // 通知上传者验证结果
    await notificationUtils.createNotification({
      userId: evidence.uploaderId.toString(),
      senderId: currentUser.userId,
      type: NotificationType.EVIDENCE_VERIFIED,
      title: `证据验证${status === 'approved' ? '通过' : '拒绝'}`,
      content: `您上传的证据 "${evidence.title}" 已被警察验证为${status === 'approved' ? '通过' : '拒绝'}。${reason ? `原因：${reason}` : ''}`,
      priority: NotificationPriority.HIGH,
      relatedCaseId: caseDoc._id.toString(),
      relatedEvidenceId: evidence._id.toString(),
    });

    sendSuccess(res, updated);
  } catch (error) {
    next(error);
  }
};


