/**
 * 签名登录模板代码
 * 
 * 此文件提供了基于Web3钱包签名的登录方式（可选）
 * 使用方式：
 * 1. 用户使用钱包签名一条消息
 * 2. 后端验证签名是否来自注册时的钱包地址
 * 3. 验证通过后生成JWT Token
 */

import express, { Request, Response } from 'express';
import { body, validationResult } from 'express-validator';
import { verifyMessage } from 'ethers';
import User from '../models/users.model';
import { generateToken } from '../utils/jwt';
import { setAuthCookie } from '../utils/cookies';

const router = express.Router();

// 生成登录消息
const generateLoginMessage = (address: string, nonce: string): string => {
  return `请签名此消息以登录刑事案件链上存证系统\n\n钱包地址: ${address}\n随机数: ${nonce}\n时间戳: ${Date.now()}`;
};

// 生成随机数
const generateNonce = (): string => {
  return Math.random().toString(36).substring(2, 15)
    + Math.random().toString(36).substring(2, 15);
};

/**
 * POST /api/auth/signature/request-nonce
 */
router.post(
  '/request-nonce',
  [
    body('walletAddress').notEmpty().withMessage('钱包地址不能为空'),
  ],
  async (req: Request, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(422).json({ 
          error: '验证失败',
          errors: errors.array()
        });
      }

      const { walletAddress } = req.body;

      const user = await User.findOne({ walletAddress: walletAddress.toLowerCase() });
      if (!user) {
        return res.status(404).json({ error: '该钱包地址未注册' });
      }

      const nonce = generateNonce();
      const message = generateLoginMessage(walletAddress, nonce);

      res.json({ message, nonce });
    } catch (error: any) {
      console.error('Request nonce error:', error);
      res.status(500).json({ error: '获取登录消息失败' });
    }
  }
);

/**
 * POST /api/auth/signature/login
 */
router.post(
  '/login',
  [
    body('walletAddress').notEmpty().withMessage('钱包地址不能为空'),
    body('signature').notEmpty().withMessage('签名不能为空'),
    body('nonce').notEmpty().withMessage('随机数不能为空'),
  ],
  async (req: Request, res: Response) => {
    try {
      console.log('📥 [签名登录] 收到签名登录请求:', {
        walletAddress: req.body.walletAddress,
        hasSignature: !!req.body.signature,
        nonce: req.body.nonce,
      });

      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(422).json({
          error: '验证失败',
          errors: errors.array()
        });
      }

      const { walletAddress, signature, nonce } = req.body;

      const user = await User.findOne({ walletAddress: walletAddress.toLowerCase() });
      if (!user) {
        return res.status(404).json({ error: '该钱包地址未注册' });
      }

      if (!user.isActive) {
        return res.status(401).json({ error: '账号已被禁用' });
      }

      const message = generateLoginMessage(walletAddress, nonce);

      // 校验签名
      try {
        const recoveredAddress = verifyMessage(message, signature);
        if (recoveredAddress.toLowerCase() !== walletAddress.toLowerCase()) {
          return res.status(401).json({ error: '签名验证失败' });
        }
      } catch (e) {
        return res.status(401).json({ error: '签名格式错误' });
      }

      const token = generateToken({
        userId: user._id.toString(),
        role: user.role,
        email: user.email,
      });

      setAuthCookie(res, token);

      res.json({
        message: '登录成功',
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          walletAddress: user.walletAddress,
        },
      });
    } catch (error: any) {
      console.error('❌ [签名登录] 登录错误:', error);
      res.status(500).json({ error: '登录失败，请稍后重试' });
    }
  }
);

export default router;
