import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import fs from 'fs';

import authRoutes from './routes/auth.router';
import caseRoutes from './routes/case.router';
import evidenceRoutes from './routes/evidence.router';
import correctionRoutes from './routes/correction.router';
import materialRoutes from './routes/defense-material.router';
import userRoutes from './routes/users.router';
import objectionRoutes from './routes/objection.router';
import notificationRoutes from './routes/notifications.router';
import operationLogRoutes from './routes/operation-logs.router'
import exportRoutes from './routes/export.router';
import { HttpError } from './utils/errors';
import { sendError } from './utils/response';

dotenv.config();

const app = express();

const uploadDir = process.env.UPLOAD_DIR || './uploads';
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

app.use(helmet());
app.use(
  cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
  })
);
app.use(cookieParser());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
});
app.use('/api/', limiter);

app.use('/uploads', express.static(uploadDir));

mongoose
  .connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/evidence_db')
  .then(() => console.log('✅ MongoDB connected'))
  .catch((err) => console.error('❌ MongoDB connection error:', err));

app.use('/api/auth', authRoutes);
app.use('/api/cases', caseRoutes);
app.use('/api/corrections', correctionRoutes);
app.use('/api/defense-materials', materialRoutes);
app.use('/api/evidence', evidenceRoutes);
app.use('/api/export', exportRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/objections', objectionRoutes);
app.use('api/operation-logs',operationLogRoutes)
app.use('/api/users', userRoutes);


app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

/**
 * 全局错误处理中间件
 * 注意：为了前端能正确显示错误信息，统一返回字符串格式的错误消息
 * 如果错误包含详细信息，可以通过 details 字段传递（前端可以选择性使用）
 */
app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  if (err instanceof HttpError) {
    // 对于 HttpError，直接使用错误消息作为字符串
    // 这样前端可以直接显示，避免React渲染对象错误
    return sendError(res, err.statusCode, err.message);
  }

  console.error('Unhandled error:', err);
  return sendError(res, 500, 'Internal server error');
});

export default app;

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
