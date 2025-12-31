import mongoose, { Document, ObjectId, Schema } from 'mongoose';
import bcrypt from 'bcryptjs';

export enum UserRole {
  JUDGE = 'judge',
  PROSECUTOR = 'prosecutor',
  LAWYER = 'lawyer',
  POLICE = 'police', 
  ADMIN = 'admin',
}

export interface IUser extends Document {
  name: string; 
  email: string;
  password: string;
  avatar: string; 
  role: UserRole;
  // 角色特定字段
  judgeId?: string; 
  prosecutorId?: string;
  department?: string;
  lawyerId?: string; 
  lawFirm?: string; 
  policeId?: string; 
  policeStation?: string; 
  adminId?: string; 
  // 通用字段
  phone?: string;
  address?: string;
  walletAddress?: string; 
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

const UserSchema = new Schema<IUser>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
    },
    avatar: {
      type: String,
      trim: true,
    },
    role: {
      type: String,
      enum: Object.values(UserRole),
      required: true,
    },
    // 角色特定字段
    judgeId: {
      type: String,
      sparse: true,
      unique: true,
    },
    prosecutorId: {
      type: String,
      sparse: true,
      unique: true,
    },
    department: {
      type: String,
      sparse: true,
    },
    lawyerId: {
      type: String,
      sparse: true,
      unique: true,
    },
    lawFirm: {
      type: String,
      sparse: true,
    },
    policeId: {
      type: String,
      sparse: true,
      unique: true,
    },
    policeStation: {
      type: String,
      sparse: true,
    },
    adminId: {
      type: String,
      sparse: true,
      unique: true,
    },
    // 通用字段
    phone: {
      type: String,
      unique: true,
    },
    address: {
      type: String,
    },
    walletAddress: {
      type: String,
      sparse: true, // 允许为空，但如果有值则唯一
      lowercase: true,
      trim: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// 密码加密中间件
UserSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

// 密码比较方法
UserSchema.methods.comparePassword = async function (candidatePassword: string): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password);
};

export default mongoose.model<IUser>('User', UserSchema);

