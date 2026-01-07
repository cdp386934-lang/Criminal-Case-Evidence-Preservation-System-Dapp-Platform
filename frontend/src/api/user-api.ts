import { GrantRoleParams, ListRolesParams, UpdateRoleParams, ListRolesResponse } from "../models/user.model";
import ApiClient from "./api-client";

/** 获取当前用户信息 */
export const getMe = () =>
    ApiClient.get<{ success: boolean; data: any }>('/users/me');

/** 获取所有用户（管理员） */
export const listUsers = () =>
    ApiClient.get<{ success: boolean; data: any[] }>('/users');

/** 获取用户详情 */
export const getUserById = (id: string) =>
    ApiClient.get<{ success: boolean; data: any }>(`/users/${id}`);

/** 更新用户信息 */
export const updateUser = (id: string, data: { name?: string; phone?: string; address?: string }) =>
    ApiClient.put<{ success: boolean; data: any }>(`/users/${id}`, data);

/** 授权角色 */
export const grantJudge = (params: GrantRoleParams) =>
    ApiClient.post<{ txHash: string }>('/users/admin/set-judge', params);

export const grantProsecutor = (params: GrantRoleParams) =>
    ApiClient.post<{ txHash: string }>('/users/admin/set-prosecutor', params);

export const grantLawyer = (params: GrantRoleParams) =>
    ApiClient.post<{ txHash: string }>('/users/admin/set-lawyer', params);

export const grantPolice = (params: GrantRoleParams) =>
    ApiClient.post<{ txHash: string }>('/users/admin/set-police', params);

/** 查询角色列表（分页 / 模糊搜索） */
export const listRoles = (params: ListRolesParams) =>
    ApiClient.get<ListRolesResponse>('/users/admin/roles', { params });

/** 更新角色 */
export const updateRole = (assignmentId: string, params: UpdateRoleParams) =>
    ApiClient.put<{ txHash: string }>(`/users/admin/roles/${assignmentId}`, params);

/** 撤销角色 */
const revokeRole = (assignmentId: string) =>
    ApiClient.delete(`/users/admin/roles/${assignmentId}`);


export const UserApi = {
    getMe,
    listUsers,
    getUserById,
    updateUser,
    grantJudge,
    grantProsecutor,
    grantLawyer,
    grantPolice,
    listRoles,
    updateRole,
    revokeRole,
}