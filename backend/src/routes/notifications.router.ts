import express from 'express';
import { authenticate } from '../middleware/auth';
import {
  createNotification,
  listNotifications,
  getNotification,
  updateNotification,
  deleteNotification,
  getMyNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
} from '../controllers/notification.controller';

const router = express.Router();

// 管理员路由
router.post('/admin/create', authenticate, createNotification);
router.get('/admin/list', authenticate, listNotifications);
router.get('/admin/:id', authenticate, getNotification);
router.put('/admin/:id', authenticate, updateNotification);
router.delete('/admin/:id', authenticate, deleteNotification);

// 用户路由
router.get('/', authenticate, getMyNotifications);
router.get('/unread/count', authenticate, getUnreadCount);
router.patch('/:id/read', authenticate, markAsRead);
router.patch('/read-all', authenticate, markAllAsRead);

export default router;

