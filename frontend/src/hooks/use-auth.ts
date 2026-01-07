import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { AuthApi } from '../api/auth.api';
import toast from 'react-hot-toast';

export function useAuth() {
  const navigate = useNavigate();
  const { user, token, isAuthenticated, setUser, setToken, logout: logoutStore } = useAuthStore();

  const login = useCallback(async (email: string, password: string) => {
    try {
      const response = await AuthApi.login({ email, password });
      const { user: userData, token: tokenData } = response.data.data;
      
      setUser(userData);
      setToken(tokenData);
      
      toast.success('登录成功');
      return { user: userData, token: tokenData };
    } catch (error: any) {
      const message = error.response?.data?.message || '登录失败';
      toast.error(message);
      throw error;
    }
  }, [setUser, setToken]);

  const register = useCallback(async (data: any, avatarFile?: File) => {
    try {
      const response = await AuthApi.register(data, avatarFile);
      const { user: userData, token: tokenData } = response.data.data;
      
      setUser(userData);
      setToken(tokenData);
      
      toast.success('注册成功');
      return { user: userData, token: tokenData };
    } catch (error: any) {
      const message = error.response?.data?.message || '注册失败';
      toast.error(message);
      throw error;
    }
  }, [setUser, setToken]);

  const logout = useCallback(async () => {
    try {
      await AuthApi.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      logoutStore();
      navigate('/login');
    }
  }, [logoutStore, navigate]);

  const checkAuth = useCallback(async () => {
    try {
      const response = await AuthApi.getMe();
      setUser(response.data.data);
      return true;
    } catch (error) {
      logoutStore();
      return false;
    }
  }, [setUser, logoutStore]);

  return {
    user,
    token,
    isAuthenticated,
    login,
    register,
    logout,
    checkAuth,
  };
}

