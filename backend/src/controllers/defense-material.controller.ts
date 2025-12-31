// 辩护材料控制器
import { NextFunction, Response } from 'express';
import crypto from 'crypto';
import { AuthRequest, AuthenticatedUserPayload } from '../middleware/auth';
import { UserRole } from '../models/users.model';
import { CaseStatus } from '../models/case.model';
import Case, { ICase } from '../models/case.model';
import DefenseMaterial, { IDefenseMaterial, CreateDefenseMaterialDTO, UpdateDefenseMaterialDTO, AddMaterialBody } from '../models/defense-material.model';
import { uploadMaterialToBlockchain } from '../utils/blockchain';
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
 * Defense Material Service Functions
 */
const createDefenseMaterial = async (payload: CreateDefenseMaterialDTO): Promise<IDefenseMaterial> => {
  const caseDocument = await Case.findById(payload.caseId);
  if (!caseDocument) {
    throw new NotFoundError('Case not found');
  }

  const { materialId, txHash } = await uploadMaterialToBlockchain(
    caseDocument.caseNumber,
    payload.fileHash
  );

  const material = new DefenseMaterial({
    caseId: payload.caseId,
    lawyerId: payload.lawyerId,
    title: payload.title,
    description: payload.description,
    fileHash: payload.fileHash,
    fileName: payload.fileName,
    filePath: payload.filePath,
    fileSize: payload.fileSize,
    fileType: payload.fileType,
    materialType: payload.materialType,
    blockchainTxHash: txHash,
    blockchainMaterialId: materialId,
  });

  return material.save();
};

const updateDefenseMaterial = async (
  id: string,
  updates: UpdateDefenseMaterialDTO
): Promise<IDefenseMaterial> => {
  const updated = await DefenseMaterial.findByIdAndUpdate(id, updates, { new: true });
  if (!updated) {
    throw new NotFoundError('Defense material not found');
  }
  return updated;
};

const deleteDefenseMaterial = async (id: string): Promise<void> => {
  const deleted = await DefenseMaterial.findByIdAndDelete(id);
  if (!deleted) {
    throw new NotFoundError('Defense material not found');
  }
};

const getDefenseMaterialById = async (id: string): Promise<IDefenseMaterial | null> => {
  return DefenseMaterial.findById(id)
    .populate('lawyerId', 'name email role')
    .populate('caseId', 'caseNumber caseTitle status');
};

const listDefenseMaterialsByCase = async (caseId: string): Promise<IDefenseMaterial[]> => {
  return DefenseMaterial.find({ caseId }).sort({ createdAt: -1 });
};

type ControllerHandler = (req: AuthRequest, res: Response, next: NextFunction) => Promise<void>;

const MATERIAL_UPLOAD_STAGES = new Set<CaseStatus>([CaseStatus.COURT_TRIAL]);
const MATERIAL_VIEW_STAGES = new Set<CaseStatus>([
  CaseStatus.COURT_TRIAL,
  CaseStatus.INVESTIGATION,
  CaseStatus.CLOSED,
]);

const ensureCaseAccess = async (caseId: string, user?: AuthenticatedUserPayload, purpose: 'view' | 'upload' = 'view') => {
  const caseDocument = await getCaseById(caseId);
  if (!caseDocument) {
    throw new NotFoundError('Case not found');
  }

  if (!user) {
    throw new ForbiddenError('Authentication required');
  }

  const hasAccess = isCaseParticipant(caseDocument, user.userId, user.role);
  if (!hasAccess) {
    throw new ForbiddenError('You are not assigned to this case');
  }

  if (purpose === 'upload' && !MATERIAL_UPLOAD_STAGES.has(caseDocument.status)) {
    throw new ForbiddenError('Defense materials can only be submitted during court trial');
  }

  if (purpose === 'view' && !MATERIAL_VIEW_STAGES.has(caseDocument.status) && user.role === UserRole.LAWYER) {
    throw new ForbiddenError('Lawyers can only view materials during or after court trial');
  }

  return caseDocument;
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
    const caseDocument = await ensureCaseAccess(material.caseId.toString(), currentUser, 'upload');

    // 验证是否是材料的上传者：只有上传者可以更新自己上传的材料
    if (material.lawyerId.toString() !== currentUser.userId) {
      throw new ForbiddenError('Only the uploader can update this material');
    }

    const updates = req.body as UpdateDefenseMaterialDTO;
    const updated = await updateDefenseMaterial(req.params.id, updates);
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
    const caseDocument = await ensureCaseAccess(material.caseId.toString(), currentUser, 'upload');

    // 验证是否是材料的上传者：只有上传者可以删除自己上传的材料
    if (material.lawyerId.toString() !== currentUser.userId) {
      throw new ForbiddenError('Only the uploader can delete this material');
    }

    await deleteDefenseMaterial(req.params.id);
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
    const caseDocument = await ensureCaseAccess(material.caseId.toString(), req.user, 'view');
    const user = req.user;
    const hasAccess = user && isCaseParticipant(caseDocument, user.userId, user.role);
    if (!hasAccess) {
      throw new ForbiddenError('You are not assigned to this case, cannot view this material');
    }

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
    const caseDocument = await ensureCaseAccess(caseId, req.user, 'view');
    const user = req.user;
    const hasAccess = user && isCaseParticipant(caseDocument, user.userId, user.role);
    if (!hasAccess) {
      throw new ForbiddenError('You are not assigned to this case, cannot view material list');
    }

    const materials = await listDefenseMaterialsByCase(caseId);
    sendSuccess(res, materials);
  } catch (error) {
    next(error);
  }
};

