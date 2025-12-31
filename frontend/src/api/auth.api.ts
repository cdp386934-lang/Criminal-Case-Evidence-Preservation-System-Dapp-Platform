import { AuthResponse, LoginRequest, RegisterRequest } from "../models/auth.model";
import ApiClient from "./api-client";


export const AuthApi = {
  login: (data: LoginRequest) =>
    ApiClient.post<{ success: boolean; data: AuthResponse }>('/auth/login', data, { withCredentials: true }),

  register: (data: RegisterRequest, avatarFile?: File) => {
    const formData = new FormData();
    // 添加表单字段
    Object.keys(data).forEach((key) => {
      const value = (data as any)[key];
      if (value !== undefined && value !== null) {
        formData.append(key, value);
      }
    });

    // 添加头像文件
    if (avatarFile) {
      formData.append('avatar', avatarFile);
    }

    return ApiClient.post<{
      txHash: any; success: boolean; data: AuthResponse
    }>('/auth/register', formData, {
      withCredentials: true,
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },

  getMe: () =>
    ApiClient.get<{ success: boolean; data: any }>('/users/me', { withCredentials: true }),

  logout: () =>
    ApiClient.post('/auth/logout', {}, { withCredentials: true }),
};

