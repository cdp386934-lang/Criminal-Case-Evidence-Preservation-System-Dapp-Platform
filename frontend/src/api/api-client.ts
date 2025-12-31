import axios from 'axios';

const ApiClient = axios.create({
  baseURL: 'http://localhost:3001/api',
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // 允许发送Cookie
});

// 请求拦截器：添加 token
ApiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 响应拦截器：处理错误
ApiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // 避免在登录/注册页面时循环重定向
    if (typeof window !== 'undefined') {
      const isAuthPage = window.location.pathname === '/login' || window.location.pathname === '/register';
      
      if (error.response?.status === 401 && !isAuthPage) {
        console.log('🔒 [API] 401未授权，清除认证信息并跳转到登录页');
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        // 动态导入 useAuthStore 避免循环依赖
        import('../../store/authStore').then(({ useAuthStore }) => {
          const { logout } = useAuthStore.getState();
          logout();
        });
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default ApiClient;