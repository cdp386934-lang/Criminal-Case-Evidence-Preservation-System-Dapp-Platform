import multer from 'multer';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';

const uploadDir = process.env.UPLOAD_DIR || './uploads';
const maxAvatarSize = 5 * 1024 * 1024; // 5MB

// 确保上传目录存在
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// 头像存储配置
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // 按日期创建子目录
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const subDir = path.join(uploadDir, `${year}/${month}/${day}`);

    if (!fs.existsSync(subDir)) {
      fs.mkdirSync(subDir, { recursive: true });
    }

    cb(null, subDir);
  },
  filename: (req, file, cb) => {
    // 生成唯一文件名：UUID + 原始扩展名
    const ext = path.extname(file.originalname);
    const filename = `avatar_${crypto.randomUUID()}${ext}`;
    cb(null, filename);
  },
});

// 头像文件过滤器（只允许图片）
const fileFilter = (req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
  
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Only image files (JPEG, PNG, GIF, WebP) are allowed for avatars'));
  }
};

export const avatarUpload = multer({
  storage,
  limits: {
    fileSize: maxAvatarSize,
  },
  fileFilter,
});

