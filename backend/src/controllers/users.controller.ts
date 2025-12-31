import { NextFunction, Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { UserRole} from '../models/users.model';
import { RoleAssignmentModel } from '../models/role-assignment.model';
import { requireRole } from '../types/rbac';
import { BadRequestError, ForbiddenError, NotFoundError } from '../utils/errors';
import {
  grantJudgeRole,
  grantProsecutorRole,
  grantLawyerRole,
  grantPoliceRole,
  revokeJudgeRole,
  revokeProsecutorRole,
  revokeLawyerRole,
  revokePoliceRole,
} from '../utils/blockchain';
import { sendSuccess } from '../utils/response';

type ControllerHandler = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => Promise<void>;

/** =====================
 *  权限校验
 ====================== */
const ensureAdmin = (req: AuthRequest) => {
  const current = requireRole(req.user, [UserRole.ADMIN]);
  if (!current) {
    throw new ForbiddenError('admin permission required');
  }
};

/** =====================
 *  通用授权逻辑
 ====================== */
async function grantRole(
  role: UserRole,
  address: string,
  req: AuthRequest
) {
  const normalized = address.toLowerCase();

  const existing = await RoleAssignmentModel.findOne({
    address: normalized,
    role,
    status: 'active',
  });

  if (existing) {
    throw new BadRequestError('role already granted');
  }

  let txHash: string;

  switch (role) {
    case UserRole.JUDGE:
      ({ txHash } = await grantJudgeRole(normalized));
      break;
    case UserRole.PROSECUTOR:
      ({ txHash } = await grantProsecutorRole(normalized));
      break;
    case UserRole.LAWYER:
      ({ txHash } = await grantLawyerRole(normalized));
      break;
    case UserRole.POLICE:
      ({ txHash } = await grantPoliceRole(normalized));
      break;
    default:
      throw new BadRequestError('invalid role');
  }

    await RoleAssignmentModel.create({
    address: normalized,
    role,
    grantedBy: req.user!.id,
    txHash,
    status: 'active',
  });

  return txHash;
}

/** =====================
 *  Create（授权）
 ====================== */
export const setJudge: ControllerHandler = async (req, res, next) => {
  try {
    ensureAdmin(req);
    const { address } = req.body;
    if (!address) throw new BadRequestError('address is required');

    const txHash = await grantRole(UserRole.JUDGE, address, req);
    sendSuccess(res, { txHash });
  } catch (e) {
    next(e);
  }
};

export const setProsecutor: ControllerHandler = async (req, res, next) => {
  try {
    ensureAdmin(req);
    const { address } = req.body;
    if (!address) throw new BadRequestError('address is required');

    const txHash = await grantRole(UserRole.PROSECUTOR, address, req);
    sendSuccess(res, { txHash });
  } catch (e) {
    next(e);
  }
};

export const setLawyer: ControllerHandler = async (req, res, next) => {
  try {
    ensureAdmin(req);
    const { address } = req.body;
    if (!address) throw new BadRequestError('address is required');

    const txHash = await grantRole(UserRole.LAWYER, address, req);
    sendSuccess(res, { txHash });
  } catch (e) {
    next(e);
  }
};

export const setPolice: ControllerHandler = async (req, res, next) => {
  try {
    ensureAdmin(req);
    const { address } = req.body;
    if (!address) throw new BadRequestError('address is required');

    const txHash = await grantRole(UserRole.POLICE, address, req);
    sendSuccess(res, { txHash });
  } catch (e) {
    next(e);
  }
};

/** =====================
 *  Read（分页 / 模糊搜索）
 ====================== */
export const listRoles: ControllerHandler = async (req, res, next) => {
  try {
    ensureAdmin(req);

    const {
      role,
      address,
      status,
      page = 1,
      pageSize = 10,
    } = req.query as any;

    const query: any = {};
    if (role) query.role = role;
    if (status) query.status = status;
    if (address) query.address = { $regex: address, $options: 'i' };

    const [list, total] = await Promise.all([
      RoleAssignmentModel.find(query)
        .sort({ createdAt: -1 })
        .skip((Number(page) - 1) * Number(pageSize))
        .limit(Number(pageSize)),
      RoleAssignmentModel.countDocuments(query),
    ]);

    sendSuccess(res, {
      list,
      total,
      page: Number(page),
      pageSize: Number(pageSize),
    });
  } catch (e) {
    next(e);
  }
};

/** =====================
 *  Update（角色变更）
 *  逻辑：撤销旧角色 + 授权新角色
 ====================== */
export const updateRole: ControllerHandler = async (req, res, next) => {
  try {
    ensureAdmin(req);

    const { id } = req.params;
    const { newRole } = req.body as { newRole?: UserRole };

    if (!newRole) {
      throw new BadRequestError('newRole is required');
    }

    const assignment = await RoleAssignmentModel.findById(id);
    if (!assignment || assignment.status !== 'active') {
      throw new NotFoundError('role assignment not found');
    }

    // 撤销旧角色
    switch (assignment.role) {
      case UserRole.JUDGE:
        await revokeJudgeRole(assignment.address);
        break;
      case UserRole.PROSECUTOR:
        await revokeProsecutorRole(assignment.address);
        break;
      case UserRole.LAWYER:
        await revokeLawyerRole(assignment.address);
        break;
      case UserRole.POLICE:
        await revokePoliceRole(assignment.address);
        break;
    }

    assignment.status = 'revoked';
    assignment.revokedAt = new Date();
    await assignment.save();

    // 授权新角色
    const txHash = await grantRole(newRole, assignment.address, req);

    sendSuccess(res, { txHash });
  } catch (e) {
    next(e);
  }
};

/** =====================
 *  Delete（撤销角色）
 ====================== */
export const revokeRole: ControllerHandler = async (req, res, next) => {
  try {
    ensureAdmin(req);

    const { id } = req.params;
      const assignment = await RoleAssignmentModel.findById(id);

    if (!assignment || assignment.status !== 'active') {
      throw new NotFoundError('role assignment not found');
    }

    switch (assignment.role) {
      case UserRole.JUDGE:
        await revokeJudgeRole(assignment.address);
        break;
      case UserRole.PROSECUTOR:
        await revokeProsecutorRole(assignment.address);
        break;
      case UserRole.LAWYER:
        await revokeLawyerRole(assignment.address);
        break;
      case UserRole.POLICE:
        await revokePoliceRole(assignment.address);
        break;
    }

    assignment.status = 'revoked';
    assignment.revokedAt = new Date();
    await assignment.save();

    sendSuccess(res, null);
  } catch (e) {
    next(e);
  }
};
