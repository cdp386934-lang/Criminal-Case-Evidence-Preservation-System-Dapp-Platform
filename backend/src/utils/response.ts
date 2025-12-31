import { Response } from 'express';

export interface ApiResponse<T = unknown> {
  success: boolean;
  data: T | null;
  error: string | Record<string, unknown> | null;
}

export const sendSuccess = <T>(res: Response, data: T, statusCode = 200): Response<ApiResponse<T>> => {
  return res.status(statusCode).json({
    success: true,
    data,
    error: null,
  });
};

export const sendError = (
  res: Response,
  statusCode: number,
  error: string | Record<string, unknown>
): Response<ApiResponse<null>> => {
  return res.status(statusCode).json({
    success: false,
    data: null,
    error,
  });
};


