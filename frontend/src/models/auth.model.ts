export interface LoginRequest {
    email: string;
    password: string;
  }
  
  export interface RegisterRequest {
    name: string;
    email: string;
    password: string;
    role: 'police' | 'prosecutor' | 'judge' | 'lawyer'|'admin';
    phone?: string;
    address?: string;
    // 角色特定字段
    judgeId?: string;
    prosecutorId?: string;
    department?: string;
    lawyerId?: string;
    lawFirm?: string;
    policeId?: string;
    policeStation?: string;
    adminId?: string;
  }
  
  export interface AuthResponse {
    user: any;
    token: string;
  }