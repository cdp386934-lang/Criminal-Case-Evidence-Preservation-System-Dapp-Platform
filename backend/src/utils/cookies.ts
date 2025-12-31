import { Response } from 'express';

const COOKIE_NAME = 'auth_token';
const COOKIE_MAX_AGE = 7 * 24 * 60 * 60 * 1000; // 7 days in milliseconds
const isProduction = process.env.NODE_ENV === 'production';

/**
 * 设置认证 Cookie
 */
export const setAuthCookie = (res: Response, token: string) => {
  res.cookie(COOKIE_NAME, token, {
    httpOnly: true,
    secure: isProduction,
    sameSite: 'strict',
    maxAge: COOKIE_MAX_AGE,
    path: '/',
  });
};

/**
 * 清除认证 Cookie
 */
export const clearAuthCookie = (res: Response) => {
  res.cookie(COOKIE_NAME, '', {
    httpOnly: true,
    secure: isProduction,
    sameSite: 'strict',
    maxAge: 0,
    path: '/',
  });
};

/**
 * 从 Cookie 中获取 Token
 */
export const getTokenFromCookie = (req: any): string | null => {
  return req.cookies?.[COOKIE_NAME] || null;
};

