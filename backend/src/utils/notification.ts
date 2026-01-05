import Notification, { NotificationType, NotificationPriority, PushStatus } from '../models/notification.model';
import mongoose from 'mongoose';
import User, { UserRole } from '../models/users.model';

interface CreateNotificationParams {
  userId: string | mongoose.Types.ObjectId;
  senderId?: string | mongoose.Types.ObjectId;
  type: NotificationType;
  title: string;
  content: string;
  priority?: NotificationPriority;
  relatedCaseId?: string | mongoose.Types.ObjectId;
  relatedEvidenceId?: string | mongoose.Types.ObjectId;
  relatedObjectionId?: string | mongoose.Types.ObjectId;
}

/**
 * 创建通知
 */
export const createNotification = async (params: CreateNotificationParams) => {
  try {
    const notification = new Notification({
      userId: params.userId,
      senderId: params.senderId,
      type: params.type,
      title: params.title,
      content: params.content,
      priority: params.priority || NotificationPriority.NORMAL,
      relatedCaseId: params.relatedCaseId,
      relatedEvidenceId: params.relatedEvidenceId,
      relatedObjectionId: params.relatedObjectionId,
      pushStatus: PushStatus.SENT, // 自动推送的通知直接标记为已发送
      pushedAt: new Date(),
    });

    await notification.save();
    return notification;
  } catch (error: any) {
    console.error('Failed to create notification:', error);
    // 通知创建失败不应该影响主流程
    return null;
  }
};

/**
 * 创建多个通知（批量）
 */
export const createNotifications = async (notifications: CreateNotificationParams[]) => {
  try {
    const results = await Promise.allSettled(
      notifications.map((params) => createNotification(params))
    );
    return results;
  } catch (error: any) {
    console.error('Failed to create notifications:', error);
    return [];
  }
};

/**
 * 按角色批量创建通知
 * @param roles 目标角色列表
 * @param params 通知参数（不包含userId）
 */
export const createNotificationsByRoles = async (
  roles: UserRole[],
  params: Omit<CreateNotificationParams, 'userId'>
) => {
  try {
    // 查找所有匹配角色的用户
    const users = await User.find({ role: { $in: roles }, isActive: true }).select('_id');
    
    if (users.length === 0) {
      return [];
    }

    // 为每个用户创建通知
    const notifications = users.map(user => ({
      ...params,
      userId: user._id,
    }));

    return await createNotifications(notifications);
  } catch (error: any) {
    console.error('Failed to create notifications by roles:', error);
    return [];
  }
};

/**
 * 为案件参与者创建通知
 * @param casedDoc 案件文档
 * @param params 通知参数（不包含userId）
 */
export const createNotificationsForCaseParticipants = async (
  casedDoc: any,
  params: Omit<CreateNotificationParams, 'userId'>
) => {
  try {
    const userIds: mongoose.Types.ObjectId[] = [];

    // 收集所有参与者ID
    if (casedDoc.policeId) {
      userIds.push(casedDoc.policeId);
    }
    if (casedDoc.prosecutorIds && casedDoc.prosecutorIds.length > 0) {
      userIds.push(...casedDoc.prosecutorIds);
    }
    if (casedDoc.judgeIds && casedDoc.judgeIds.length > 0) {
      userIds.push(...casedDoc.judgeIds);
    }
    if (casedDoc.lawyerIds && casedDoc.lawyerIds.length > 0) {
      userIds.push(...casedDoc.lawyerIds);
    }

    // 去重
    const uniqueUserIds = Array.from(new Set(userIds.map(id => id.toString())));

    if (uniqueUserIds.length === 0) {
      return [];
    }

    // 为每个参与者创建通知
    const notifications = uniqueUserIds.map(userId => ({
      ...params,
      userId,
    }));

    return await createNotifications(notifications);
  } catch (error: any) {
    console.error('Failed to create notifications for case participants:', error);
    return [];
  }
};

