// 辩护材料控制器
import { NextFunction, Response } from 'express';
import { AuthRequest, AuthenticatedUserPayload } from '../middleware/auth';
import { UserRole } from '../models/users.model';
import { CaseStatus } from '../models/case.model';
import { requireRole } from '../types/rbac';
import { BadRequestError, ForbiddenError, NotFoundError } from '../utils/errors';
import { sendSuccess } from '../utils/response';
import { isCaseParticipant } from '../services/case.helper.service';
import { getCaseById } from '../services/case.service'
import { createDefenseMaterial, deleteDefenseMaterial, getDefenseMaterialById, listDefenseMaterialsByCase, updateDefenseMaterial } from '../services/defense-material.service';
import { CreateDefenseMaterialDTO, UpdateDefenseMaterialDTO } from '../dto/defense-material.dto';
import { recordOperation } from './operation-logs.controller';
import { OperationType,OperationTargetType } from '../models/operation-logs.model';

interface AddMaterialBody {
  caseId: string;
  title: string;
  description?: string;
  fileHash: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  materialType: string;
}

type ControllerHandler = (req: AuthRequest, res: Response, next: NextFunction) => Promise<void>;

const MATERIAL_UPLOAD_STAGES = new Set<CaseStatus>([CaseStatus.COURT_TRIAL]);
const MATERIAL_VIEW_STAGES = new Set<CaseStatus>([
  CaseStatus.COURT_TRIAL,
  CaseStatus.INVESTIGATION,
  CaseStatus.CLOSED,
]);

const ensureCaseAccess = async (caseId: string, user?: AuthenticatedUserPayload, purpose: 'view' | 'upload' = 'view') => {
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

  if (purpose === 'upload' && !MATERIAL_UPLOAD_STAGES.has(caseDoc.status)) {
    throw new ForbiddenError('Defense materials can only be submitted during court trial');
  }

  if (purpose === 'view' && !MATERIAL_VIEW_STAGES.has(caseDoc.status) && user.role === UserRole.LAWYER) {
    throw new ForbiddenError('Lawyers can only view materials during or after court trial');
  }

  return caseDoc;
};

/**
 * 上传辩护材料（仅律师可访问）
 * 权限：只有律师可以上传辩护材料，且必须是案件的参与者
 * @param req 请求对象，包含材料数据和当前用户信息
 * @param res 响应对象
 * @param next 错误处理中间件
 */
export const addMaterial: ControllerHandler = async (req, res, next) => {
  try {
    // 验证用户角色：只有律师可以上传辩护材料
    const currentUser = requireRole(req.user, [UserRole.LAWYER]);
    const payload = req.body as AddMaterialBody;

    // 验证必填字段
    if (
      !payload.caseId ||
      !payload.title ||
      !payload.fileHash ||
      !payload.fileName ||
      !payload.fileType ||
      !payload.materialType ||
      typeof payload.fileSize === 'undefined'
    ) {
      throw new BadRequestError('Missing required material fields');
    }

    // 权限与阶段校验
    await ensureCaseAccess(payload.caseId, currentUser, 'upload');

    // 创建辩护材料
    const createdMaterial = await createDefenseMaterial({
      caseId: payload.caseId,
      lawyerId: currentUser.userId,
      title: payload.title,
      description: payload.description,
      fileHash: payload.fileHash,
      fileName: payload.fileName,
      fileType: payload.fileType,
      fileSize: Number(payload.fileSize),
      materialType: payload.materialType as CreateDefenseMaterialDTO['materialType'],
    });

    await recordOperation({
      req,
      operationType:OperationType.CREATE,
      targetType: OperationTargetType.DEFENSE_MATERIAL,
      targetId: createdMaterial.id,
      description: `创建辩护材料：${createdMaterial.title}`,
    })

    sendSuccess(res, createdMaterial, 201);
  } catch (error) {
    next(error);
  }
};

/**
 * 更新辩护材料（仅律师可访问，且只能更新自己上传的材料）
 * 权限：只有上传者（律师）可以更新自己上传的材料
 * @param req 请求对象，包含材料ID和更新数据
 * @param res 响应对象
 * @param next 错误处理中间件
 */
export const updateMaterial: ControllerHandler = async (req, res, next) => {
  try {
    // 验证用户角色：只有律师可以更新材料
    const currentUser = requireRole(req.user, [UserRole.LAWYER]);

    // 检查材料是否存在
    const material = await getDefenseMaterialById(req.params.id);
    if (!material) {
      throw new NotFoundError('Defense material not found');
    }

    // 验证用户是否是案件的参与者
    const caseDoc = await ensureCaseAccess(material.caseId.toString(), currentUser, 'upload');

    // 验证是否是材料的上传者：只有上传者可以更新自己上传的材料
    if (material.lawyerId.toString() !== currentUser.userId) {
      throw new ForbiddenError('Only the uploader can update this material');
    }

    const updates = req.body as UpdateDefenseMaterialDTO;
    const updated = await updateDefenseMaterial(req.params.id, updates);
    await recordOperation({
      req,
      operationType:OperationType.UPDATE,
      targetType: OperationTargetType.DEFENSE_MATERIAL,
      targetId:material.id,
      description: `更新辩护材料：${material.title}`,
    })
    sendSuccess(res, updated);
  } catch (error) {
    next(error);
  }
};

/**
 * 删除辩护材料（仅律师可访问，且只能删除自己上传的材料）
 * 权限：只有上传者（律师）可以删除自己上传的材料
 * @param req 请求对象，包含材料ID
 * @param res 响应对象
 * @param next 错误处理中间件
 */
export const deleteMaterial: ControllerHandler = async (req, res, next) => {
  try {
    // 验证用户角色：只有律师可以删除材料
    const currentUser = requireRole(req.user, [UserRole.LAWYER]);

    // 检查材料是否存在
    const material = await getDefenseMaterialById(req.params.id);
    if (!material) {
      throw new NotFoundError('Defense material not found');
    }

    // 验证用户是否是案件的参与者
    const caseDoc = await ensureCaseAccess(material.caseId.toString(), currentUser, 'upload');

    // 验证是否是材料的上传者：只有上传者可以删除自己上传的材料
    if (material.lawyerId.toString() !== currentUser.userId) {
      throw new ForbiddenError('Only the uploader can delete this material');
    }

    await deleteDefenseMaterial(req.params.id);

    await recordOperation({
      req,
      operationType:OperationType.DELETE,
      targetType: OperationTargetType.DEFENSE_MATERIAL,
      targetId:material.id,
      description: `删除辩护材料：${material.title}`,
    })
    sendSuccess(res, null, 204);
  } catch (error) {
    next(error);
  }
};

/**
 * 获取辩护材料详情（法官、检察官、律师可访问）
 * 权限：三个角色都可以查看材料，但必须是案件的参与者
 * @param req 请求对象，包含材料ID
 * @param res 响应对象
 * @param next 错误处理中间件
 */
export const getMaterial: ControllerHandler = async (req, res, next) => {
  try {
    // 验证用户已登录（法官、检察官、律师都可以查看）
    if (!req.user) {
      throw new ForbiddenError('Authentication required');
    }

    // 检查材料是否存在
    const material = await getDefenseMaterialById(req.params.id);
    if (!material) {
      throw new NotFoundError('Defense material not found');
    }

    // 验证用户是否是案件的参与者
    const caseDoc = await ensureCaseAccess(material.caseId.toString(), req.user, 'view');
    const user = req.user;
    const hasAccess = user && isCaseParticipant(caseDoc, user);
    if (!hasAccess) {
      throw new ForbiddenError('You are not assigned to this case, cannot view this material');
    }

    await recordOperation({
      req,
      operationType:OperationType.GET,
      targetType: OperationTargetType.DEFENSE_MATERIAL,
      targetId:material.id,
      description: `获取辩护材料：${material.title}`,
    })
    sendSuccess(res, material);
  } catch (error) {
    next(error);
  }
};

/**
 * 获取案件下的辩护材料列表（法官、检察官、律师可访问）
 * 权限：三个角色都可以查看材料列表，但必须是案件的参与者
 * @param req 请求对象，包含案件ID
 * @param res 响应对象
 * @param next 错误处理中间件
 */
export const listMaterialsByCase: ControllerHandler = async (req, res, next) => {
  try {
    // 验证用户已登录（法官、检察官、律师都可以查看）
    if (!req.user) {
      throw new ForbiddenError('Authentication required');
    }

    const caseId = req.params.caseId;

    // 验证用户是否是案件的参与者
    const caseDoc = await ensureCaseAccess(caseId, req.user, 'view');
    const user = req.user;
    const hasAccess = user && isCaseParticipant(caseDoc, user);
    if (!hasAccess) {
      throw new ForbiddenError('You are not assigned to this case, cannot view material list');
    }

    const materials = await listDefenseMaterialsByCase(caseId);
    await recordOperation({
      req,
      operationType:OperationType.BATCHGET,
      targetType: OperationTargetType.DEFENSE_MATERIAL,
      targetId:req.params.targetId,
      description: `获取全部辩护材料`,
    })
    sendSuccess(res, materials);
  } catch (error) {
    next(error);
  }
};

