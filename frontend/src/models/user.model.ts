// 用户角色类型
export type UserRole = 'police' | 'judge' | 'prosecutor' | 'lawyer' | 'admin';

// 用户接口
export interface User {
    _id?: string;
    name: string;
    email: string;
    role: UserRole;
    walletAddress?: string;
    avatar?: string; // 头像URL
    phone?: string;
    address?: string;
    judgeId?: string;
    prosecutorId?: string;
    department?: string;
    lawyerId?: string;
    lawFirm?: string;
    policeId?: string;
    policeStation?: string;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface RoleAssignment {
    _id: string;
    address: string;
    role: UserRole;
    grantedBy: string;
    txHash: string;
    status: 'active' | 'revoked';
    createdAt: string;
    revokedAt?: string;
}

export interface ListRolesParams {
    role?: UserRole;
    address?: string;
    status?: 'active' | 'revoked';
    page?: number;
    pageSize?: number;
}

export interface ListRolesResponse {
    list: RoleAssignment[];
    total: number;
    page: number;
    pageSize: number;
}

export interface GrantRoleParams {
    address: string;
}

export interface UpdateRoleParams {
    newRole: UserRole;
}