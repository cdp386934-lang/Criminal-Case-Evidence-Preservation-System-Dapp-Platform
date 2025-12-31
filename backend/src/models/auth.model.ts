import { UserRole } from "./users.model";

export interface RegisterDTO {
    name: string;
    email: string;
    password: string;
    role: UserRole;
    walletAddress?: string;
    phone?: string;
    address?: string;
    avatar?: string; // 头像URL
    judgeId?: string;
    prosecutorId?: string;
    department?: string;
    lawyerId?: string;
    lawFirm?: string;
    policeId?: string; 
    policeStation?: string; 
    adminId?: string;
  }
  
  export interface LoginDTO {
    email: string;
    password: string;
  }
  
  export interface AuthenticatedUserDTO {
    id: string;
    name: string;
    email: string;
    role: UserRole;
    walletAddress?: string;
    avatar?: string; // 头像URL
  }
  
  export interface AuthResponseDTO {
    user: AuthenticatedUserDTO;
    token: string;
    txHash?: string;
  }