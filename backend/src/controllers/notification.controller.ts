import { NextFunction, Response } from 'express';
import { AuthRequest, AuthenticatedUserPayload } from '../middleware/auth';
import { UserRole } from '../models/users.model';
import Notification, { NotificationType, NotificationPriority, PushStatus } from '../models/notification.model';
import { requireRole } from '../middleware/rbac';
import { BadRequestError, ForbiddenError, NotFoundError } from '../utils/errors';
import { sendSuccess } from '../utils/response';
import * as notificationUtils from '../utils/notification';
import mongoose from 'mongoose';

type ControllerHandler = (req: AuthRequest, res: Response, next: NextFunction) => Promise<void>;

/**
 * 管理员创建通知
 * 权限：只有管理员可以创建通知
 * 支持按角色推送或指定用户推送
 */
interface CreateNotificationBody {
  title: string;
  content: string;
  type: NotificationType;
  priority?: NotificationPriority;
  targetRoles?: UserRole[]; // 按角色推送
  targetUserIds?: string[]; // 指定用户推送
  relatedCaseId?: string;
  relatedEvidenceId?: string;
  relatedObjectionId?: string;
}

export const createNotification: ControllerHandler = async (req, res, next) => {
  try {
    const currentUser = requireRole(req.user, [UserRole.ADMIN]);
    const payload = req.body as CreateNotificationBody;

    // 验证必填字段
    if (!payload.title || !payload.content || !payload.type) {
      throw new BadRequestError('Missing required fields: title, content, type');
    }

    // 必须指定推送目标（角色或用户）
    if ((!payload.targetRoles || payload.targetRoles.length === 0) && 
        (!payload.targetUserIds || payload.targetUserIds.length === 0)) {
      throw new BadRequestError('Must specify either targetRoles or targetUserIds');
    }

    const notificationParams = {
      senderId: currentUser.userId,
      type: payload.type,
      title: payload.title,
      content: payload.content,
      priority: payload.priority || NotificationPriority.NORMAL,
      relatedCaseId: payload.relatedCaseId,
      relatedEvidenceId: payload.relatedEvidenceId,
      relatedObjectionId: payload.relatedObjectionId,
    };

    const results: any[] = [];

    // 按角色推送
    if (payload.targetRoles && payload.targetRoles.length > 0) {
      const roleResults = await notificationUtils.createNotificationsByRoles(
        payload.targetRoles,
        notificationParams
      );
      results.push(...roleResults);
    }

    // 按指定用户推送
    if (payload.targetUserIds && payload.targetUserIds.length > 0) {
      const userNotifications = payload.targetUserIds.map(userId => ({
        ...notificationParams,
        userId,
      }));
      const userResults = await notificationUtils.createNotifications(userNotifications);
      results.push(...userResults);
    }

    sendSuccess(res, {
      message: '通知已创建并推送',
      count: results.filter(r => r.status === 'fulfilled').length,
    }, 201);
  } catch (error) {
    next(error);
  }
};

/**
 * 管理员获取通知列表
 * 权限：只有管理员可以查看所有通知
 */
export const listNotifications: ControllerHandler = async (req, res, next) => {
  try {
    const currentUser = requireRole(req.user, [UserRole.ADMIN]);
    const { page = '1', pageSize = '20', isRead, userId, type, priority } = req.query;

    const pageNum = Math.max(1, parseInt(page as string, 10));
    const pageSizeNum = Math.min(100, Math.max(1, parseInt(pageSize as string, 10)));

    const query: any = {};

    if (isRead !== undefined) {
      query.isRead = isRead === 'true';
    }
    if (userId) {
      query.userId = new mongoose.Types.ObjectId(userId as string);
    }
    if (type) {
      query.type = type;
    }
    if (priority) {
      query.priority = priority;
    }

    const total = await Notification.countDocuments(query);
    const notifications = await Notification.find(query)
      .populate('userId', 'name email role')
      .populate('senderId', 'name email role')
      .populate('relatedCaseId', 'caseNumber caseTitle')
      .populate('relatedEvidenceId', 'evidenceId title')
      .populate('relatedObjectionId', 'objectionId')
      .sort({ createdAt: -1 })
      .skip((pageNum - 1) * pageSizeNum)
      .limit(pageSizeNum);

    sendSuccess(res, {
      items: notifications,
      page: pageNum,
      pageSize: pageSizeNum,
      total,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * 管理员获取通知详情
 * 权限：只有管理员可以查看任意通知详情
 */
export const getNotification: ControllerHandler = async (req, res, next) => {
  try {
    const currentUser = requireRole(req.user, [UserRole.ADMIN]);
    const notification = await Notification.findById(req.params.id)
      .populate('userId', 'name email role')
      .populate('senderId', 'name email role')
      .populate('relatedCaseId', 'caseNumber caseTitle')
      .populate('relatedEvidenceId', 'evidenceId title')
      .populate('relatedObjectionId', 'objectionId');

    if (!notification) {
      throw new NotFoundError('Notification not found');
    }

    sendSuccess(res, notification);
  } catch (error) {
    next(error);
  }
};

/**
 * 管理员更新通知
 * 权限：只有管理员可以更新通知
 * 更新后会重新推送
 */
interface UpdateNotificationBody {
  title?: string;
  content?: string;
  type?: NotificationType;
  priority?: NotificationPriority;
  pushStatus?: PushStatus;
}

export const updateNotification: ControllerHandler = async (req, res, next) => {
  try {
    const currentUser = requireRole(req.user, [UserRole.ADMIN]);
    const notification = await Notification.findById(req.params.id);

    if (!notification) {
      throw new NotFoundError('Notification not found');
    }

    const updates = req.body as UpdateNotificationBody;
    
    // 如果更新了内容，重置推送状态为待推送
    if (updates.title || updates.content) {
      updates.pushStatus = PushStatus.PENDING;
    }

    // 如果指定了推送状态为已发送，更新推送时间
    if (updates.pushStatus === PushStatus.SENT && notification.pushStatus !== PushStatus.SENT) {
      (updates as any).pushedAt = new Date();
    }

    Object.assign(notification, updates);
    await notification.save();

    // 如果更新后需要重新推送，标记为已发送
    if (updates.pushStatus === PushStatus.SENT || 
        (updates.title || updates.content)) {
      notification.pushStatus = PushStatus.SENT;
      notification.pushedAt = new Date();
      await notification.save();
    }

    sendSuccess(res, notification);
  } catch (error) {
    next(error);
  }
};

/**
 * 管理员删除通知
 * 权限：只有管理员可以删除通知
 */
export const deleteNotification: ControllerHandler = async (req, res, next) => {
  try {
    const currentUser = requireRole(req.user, [UserRole.ADMIN]);
    const notification = await Notification.findById(req.params.id);

    if (!notification) {
      throw new NotFoundError('Notification not found');
    }

    await Notification.findByIdAndDelete(req.params.id);

    sendSuccess(res, null, 204);
  } catch (error) {
    next(error);
  }
};

/**
 * 用户获取自己的通知列表
 * 权限：所有已登录用户
 */
export const getMyNotifications: ControllerHandler = async (req, res, next) => {
  try {
    const currentUser = req.user;
    if (!currentUser) {
      throw new ForbiddenError('Authentication required');
    }

    const { page = '1', pageSize = '20', isRead } = req.query;
    const pageNum = Math.max(1, parseInt(page as string, 10));
    const pageSizeNum = Math.min(100, Math.max(1, parseInt(pageSize as string, 10)));

    const query: any = { userId: currentUser.userId };
    if (isRead !== undefined) {
      query.isRead = isRead === 'true';
    }

    const total = await Notification.countDocuments(query);
    const notifications = await Notification.find(query)
      .populate('senderId', 'name email role')
      .populate('relatedCaseId', 'caseNumber caseTitle')
      .populate('relatedEvidenceId', 'evidenceId title')
      .populate('relatedObjectionId', 'objectionId')
      .sort({ createdAt: -1 })
      .skip((pageNum - 1) * pageSizeNum)
      .limit(pageSizeNum);

    sendSuccess(res, {
      items: notifications,
      page: pageNum,
      pageSize: pageSizeNum,
      total,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * 用户获取未读通知数量
 * 权限：所有已登录用户
 */
export const getUnreadCount: ControllerHandler = async (req, res, next) => {
  try {
    const currentUser = req.user;
    if (!currentUser) {
      throw new ForbiddenError('Authentication required');
    }

    const count = await Notification.countDocuments({
      userId: currentUser.userId,
      isRead: false,
    });

    sendSuccess(res, { count });
  } catch (error) {
    next(error);
  }
};

/**
 * 用户标记通知为已读
 * 权限：通知的接收者
 */
export const markAsRead: ControllerHandler = async (req, res, next) => {
  try {
    const currentUser = req.user;
    if (!currentUser) {
      throw new ForbiddenError('Authentication required');
    }

    const notification = await Notification.findById(req.params.id);
    if (!notification) {
      throw new NotFoundError('Notification not found');
    }

    // 验证权限：只有通知的接收者可以标记为已读
    if (notification.userId.toString() !== currentUser.userId) {
      throw new ForbiddenError('You can only mark your own notifications as read');
    }

    notification.isRead = true;
    notification.readAt = new Date();
    await notification.save();

    sendSuccess(res, notification);
  } catch (error) {
    next(error);
  }
};

/**
 * 用户标记所有通知为已读
 * 权限：所有已登录用户
 */
export const markAllAsRead: ControllerHandler = async (req, res, next) => {
  try {
    const currentUser = req.user;
    if (!currentUser) {
      throw new ForbiddenError('Authentication required');
    }

    const result = await Notification.updateMany(
      { userId: currentUser.userId, isRead: false },
      { isRead: true, readAt: new Date() }
    );

    sendSuccess(res, {
      message: 'All notifications marked as read',
      count: result.modifiedCount,
    });
  } catch (error) {
    next(error);
  }
};

