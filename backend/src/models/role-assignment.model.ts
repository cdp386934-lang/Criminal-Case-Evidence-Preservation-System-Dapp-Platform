import mongoose, { Schema, Document, Model } from 'mongoose';
import { UserRole } from './users.model';

export type RoleAssignmentStatus = 'active' | 'revoked';
export interface RoleAssignment extends Document {
  address: string;            // 钱包地址（小写）
  role: UserRole;             // 角色
  grantedBy: string;          // admin user id
  txHash: string;             // 链上交易 hash
  status: RoleAssignmentStatus;
  revokedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const RoleAssignmentSchema = new Schema<RoleAssignment>(
  {
    address: {
      type: String,
      required: true,
      lowercase: true,
      index: true,
    },
    role: {
      type: String,
      enum: Object.values(UserRole),
      required: true,
      index: true,
    },
    grantedBy: {
      type: String,
      required: true,
      index: true,
    },
    txHash: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ['active', 'revoked'],
      default: 'active',
      index: true,
    },
    revokedAt: {
      type: Date,
    },
  },
  {
    timestamps: true, // createdAt / updatedAt
    versionKey: false,
  }
);

// 同一 address + role 只能有一个 active
RoleAssignmentSchema.index(
  { address: 1, role: 1 },
  {
    unique: true,
    partialFilterExpression: { status: 'active' },
  }
);

// 查询优化
RoleAssignmentSchema.index({ createdAt: -1 });
RoleAssignmentSchema.index({ address: 1, status: 1 });
RoleAssignmentSchema.index({ role: 1, status: 1 });

export const RoleAssignmentModel: Model<RoleAssignment> =
  mongoose.models.RoleAssignment ||
  mongoose.model<RoleAssignment>(
    'RoleAssignment',
    RoleAssignmentSchema
  );
