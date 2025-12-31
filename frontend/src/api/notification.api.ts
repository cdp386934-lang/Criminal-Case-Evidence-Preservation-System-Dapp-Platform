import { CreateNotificationParams, ListAdminNotificationsParams,UpdateNotificationParams } from "../models/notification.model";
import ApiClient from "./api-client";

/* =========================
 * 管理员 API
 * ========================= */

/** 创建通知（按角色 / 指定用户） */
export const createNotification = (params: CreateNotificationParams) =>
  ApiClient.post('/notifications/admin/create', params);

/** 管理员通知列表 */
export const listAdminNotifications = (params?: ListAdminNotificationsParams) =>
  ApiClient.get('/notifications/admin/list', { params });

/** 管理员查看通知详情 */
export const getAdminNotification = (id: string) =>
  ApiClient.get(`/notifications/admin/${id}`);

/** 管理员更新通知 */
export const updateNotification = (
  id: string,
  params: UpdateNotificationParams
) =>
  ApiClient.put(`/notifications/admin/${id}`, params);

/** 管理员删除通知 */
export const deleteNotification = (id: string) =>
  ApiClient.delete(`/notifications/admin/${id}`);

/* =========================
 * 用户 API
 * ========================= */

/** 获取我的通知列表 */
export const getMyNotifications = (params?: {
  page?: number;
  pageSize?: number;
  isRead?: boolean;
}) =>
  ApiClient.get('/notifications', { params });

/** 获取未读通知数量（红点） */
export const getUnreadNotificationCount = () =>
  ApiClient.get<{ count: number }>('/notifications/unread/count');

/** 标记单条通知为已读 */
export const markNotificationAsRead = (id: string) =>
  ApiClient.patch(`/notifications/${id}/read`);

/** 标记全部通知为已读 */
export const markAllNotificationsAsRead = () =>
  ApiClient.patch('/notifications/read-all');

// 导出统一的 API 对象
export const NotificationApi = {
  // 管理员 API
  createNotification,
  listAdminNotifications,
  getAdminNotification,
  updateNotification,
  deleteNotification,
  // 用户 API
  list: getMyNotifications,
  getById: getAdminNotification,
  getUnreadCount: getUnreadNotificationCount,
  markAsRead: markNotificationAsRead,
  markAllAsRead: markAllNotificationsAsRead,
};