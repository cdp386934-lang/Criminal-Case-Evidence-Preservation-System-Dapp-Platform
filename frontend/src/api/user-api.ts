import { GrantRoleParams, ListRolesParams, UpdateRoleParams,ListRolesResponse} from "../models/user.model";
import ApiClient from "./api-client";

/** 授权角色 */
export const grantJudge = (params: GrantRoleParams) =>
    ApiClient.post<{ txHash: string }>('/admin/roles/judge', params);

export const grantProsecutor = (params: GrantRoleParams) =>
    ApiClient.post<{ txHash: string }>('/admin/roles/prosecutor', params);

export const grantLawyer = (params: GrantRoleParams) =>
    ApiClient.post<{ txHash: string }>('/admin/roles/lawyer', params);

export const grantPolice = (params: GrantRoleParams) =>
    ApiClient.post<{ txHash: string }>('/admin/roles/police', params);

/** 查询角色列表（分页 / 模糊搜索） */
export const listRoles = (params: ListRolesParams) =>
    ApiClient.get<ListRolesResponse>('/admin/roles', { params });

/** 更新角色 */
export const updateRole = (assignmentId: string, params: UpdateRoleParams) =>
    ApiClient.put<{ txHash: string }>(`/admin/roles/${assignmentId}`, params);

/** 撤销角色 */
const revokeRole = (assignmentId: string) =>
    ApiClient.delete(`/admin/roles/${assignmentId}`);


export const UserApi = {
    grantJudge,
    grantProsecutor,
    grantLawyer,
    grantPolice,
    listRoles,
    updateRole,
    revokeRole,
}