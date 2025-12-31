import { BrowserRouter } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import AppRouter from './app-router';
import { useEffect } from 'react';
import { useAuthStore } from '../store/authStore';
import { authApi } from './api/auth.api';

function App() {
  const { setUser, setToken, token } = useAuthStore();

  useEffect(() => {
    // 检查用户是否已登录
    const checkAuth = async () => {
      const storedToken = localStorage.getItem('token');
      if (storedToken && !token) {
        try {
          const response = await authApi.getMe();
          setUser(response.data.data);
          setToken(storedToken);
        } catch (error) {
          // Token 无效，清除存储
          localStorage.removeItem('token');
          localStorage.removeItem('user');
        }
      }
    };

    checkAuth();
  }, [setUser, setToken, token]);

  return (
    <BrowserRouter>
      <div className="min-h-screen bg-gray-50">
        <AppRouter />
        <Toaster position="top-right" />
      </div>
    </BrowserRouter>
  );
}

export default App;

