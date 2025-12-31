import { RequestHandler } from 'express';
import { isAddress } from 'ethers';
import { RegisterDTO, LoginDTO, AuthResponseDTO } from '../models/auth.model';
import User, { UserRole } from '../models/users.model';
import { setAuthCookie } from '../utils/cookies';
import { BadRequestError, ConflictError, UnauthorizedError } from '../utils/errors';
import { sendSuccess } from '../utils/response';
import { generateToken } from '../utils/jwt';
import { grantJudgeRole, grantLawyerRole, grantProsecutorRole, grantPoliceRole } from '../utils/blockchain';

const normalizeWallet = (wallet?: string): string | undefined => {
  if (!wallet) {
    return undefined;
  }
  return wallet.toLowerCase();
};

const validateRoleSpecificFields = (payload: RegisterDTO) => {
  if (payload.role === UserRole.JUDGE && !payload.judgeId) {
    throw new BadRequestError('judgeId is required for judge role');
  }

  if (payload.role === UserRole.PROSECUTOR && (!payload.prosecutorId || !payload.department)) {
    throw new BadRequestError('prosecutorId and department are required for prosecutor role');
  }

  if (payload.role === UserRole.LAWYER && (!payload.lawyerId || !payload.lawFirm)) {
    throw new BadRequestError('lawyerId and lawFirm are required for lawyer role');
  }

  if (payload.role === UserRole.POLICE && (!payload.policeId || !payload.policeStation)) {
    throw new BadRequestError('policeId and policeStation are required for police role');
  }
};

const grantRoleOnChain = async (role: UserRole, walletAddress: string): Promise<string | undefined> => {
  if (role === UserRole.JUDGE) {
    const { txHash } = await grantJudgeRole(walletAddress);
    return txHash;
  }

  if (role === UserRole.PROSECUTOR) {
    const { txHash } = await grantProsecutorRole(walletAddress);
    return txHash;
  }

  if (role === UserRole.LAWYER) {
    const { txHash } = await grantLawyerRole(walletAddress);
    return txHash;
  }

  if (role === UserRole.POLICE) {
    const { txHash } = await grantPoliceRole(walletAddress);
    return txHash;
  }
  return undefined;
};

export const registerUser: RequestHandler = async (req, res, next) => {
  try {
    const payload = req.body as RegisterDTO;
    if (!payload.name || !payload.email || !payload.password || !payload.role) {
      throw new BadRequestError('Missing required registration fields');
    }

    // 如果有上传的头像文件，构建头像URL
    if (req.file) {
      // 构建头像URL：/uploads/年/月/日/文件名
      const date = new Date();
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      payload.avatar = `/uploads/${year}/${month}/${day}/${req.file.filename}`;
    }

    // 验证角色特定字段
    validateRoleSpecificFields(payload);

    // 检查邮箱是否已注册
    const existingUser = await User.findOne({ email: payload.email });
    if (existingUser) {
      throw new ConflictError('Email already registered');
    }

    // 处理钱包地址：规范化并验证格式
    const walletAddress = normalizeWallet(payload.walletAddress);
    if (walletAddress) {
      // 验证钱包地址格式
      if (!isAddress(walletAddress)) {
        throw new BadRequestError('Invalid wallet address format');
      }

      // 检查钱包地址是否已被其他用户使用
      const walletUser = await User.findOne({ walletAddress });
      if (walletUser) {
        throw new ConflictError('Wallet address already registered');
      }
    }

    const user = new User({
      name: payload.name,
      email: payload.email,
      password: payload.password,
      role: payload.role,
      walletAddress,
      phone: payload.phone,
      address: payload.address,
      avatar: payload.avatar,
      judgeId: payload.judgeId,
      prosecutorId: payload.prosecutorId,
      department: payload.department,
      lawyerId: payload.lawyerId,
      lawFirm: payload.lawFirm,
      policeId: payload.policeId,
      policeStation: payload.policeStation,
      adminId: payload.adminId,
    });

    // 保存用户到数据库
    await user.save();

    // 如果提供了钱包地址，在链上授予角色权限
    let txHash: string | undefined;
    if (walletAddress) {
      try {
        txHash = await grantRoleOnChain(payload.role, walletAddress);
      } catch (error) {
        // 链上操作失败不影响注册，但记录错误
        console.error('链上授予角色权限失败:', error);
      }
    }

    // 生成JWT token用于后续认证
    const token = generateToken({
      userId: user._id.toString(),
      role: user.role,
      email: user.email,
    });

    const result: AuthResponseDTO = {
      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        role: user.role,
        walletAddress: user.walletAddress,
        avatar: user.avatar,
      },
      token,
      txHash,
    };

    setAuthCookie(res, result.token);
    sendSuccess(res, result, 201);
  } catch (error) {
    next(error);
  }
};

export const loginUser: RequestHandler = async (req, res, next) => {
  try {
    const payload = req.body as LoginDTO;
    if (!payload.email || !payload.password) {
      throw new BadRequestError('Email and password are required');
    }

    // 根据邮箱查找用户
    const user = await User.findOne({ email: payload.email });
    
    // 验证用户是否存在且账号是否激活
    if (!user || !user.isActive) {
      throw new UnauthorizedError('Invalid credentials');
    }

    // 验证密码
    const isValid = await user.comparePassword(payload.password);
    if (!isValid) {
      throw new UnauthorizedError('Invalid credentials');
    }

    const token = generateToken({
      userId: user._id.toString(),
      role: user.role,
      email: user.email,
    });

    const result: AuthResponseDTO = {
      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        role: user.role,
        walletAddress: user.walletAddress,
        avatar: user.avatar,
      },
      token,
    };

    setAuthCookie(res, result.token);
    sendSuccess(res, result);
  } catch (error) {
    next(error);
  }
};


