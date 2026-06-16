import mongoose, { Schema, type Document } from 'mongoose';
import type { Role } from '../../shared/constants/roles.js';

// --- USER MODEL ---
export interface IUser extends Document {
  email: string;
  passwordHash: string;
  role: Role;
  firstName: string;
  lastName: string;
  phone?: string;
  avatarUrl?: string;
  isActive: boolean;
  isEmailVerified: boolean;
  mfaEnabled: boolean;
  mfaSecret?: string;
  mfaBackupCodes?: string[];
  laboratoryId?: mongoose.Types.ObjectId | null;
  organisationId?: mongoose.Types.ObjectId | null;
  failedLoginAttempts: number;
  lockedUntil?: Date | null;
  lastLoginAt?: Date | null;
  passwordChangedAt: Date;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date | null;
}

const userSchema = new Schema<IUser>(
  {
    email: { type: String, required: true, unique: true, index: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true },
    role: { type: String, required: true },
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    phone: { type: String },
    avatarUrl: { type: String },
    isActive: { type: Boolean, default: true },
    isEmailVerified: { type: Boolean, default: false },
    mfaEnabled: { type: Boolean, default: false },
    mfaSecret: { type: String }, // Encrypted AES-256-GCM
    mfaBackupCodes: { type: [String] }, // Hashed
    laboratoryId: { type: Schema.Types.ObjectId, default: null, index: true },
    organisationId: { type: Schema.Types.ObjectId, default: null },
    failedLoginAttempts: { type: Number, default: 0 },
    lockedUntil: { type: Date, default: null },
    lastLoginAt: { type: Date, default: null },
    passwordChangedAt: { type: Date, default: Date.now },
    deletedAt: { type: Date, default: null },
  },
  { timestamps: true },
);

// Soft delete query middleware
userSchema.pre('find', function () {
  this.where({ deletedAt: null });
});
userSchema.pre('findOne', function () {
  this.where({ deletedAt: null });
});

export const UserModel = mongoose.model<IUser>('User', userSchema);

// --- PERMISSION MODEL ---
export interface IPermission extends Document {
  role: string;
  permissions: string[];
  updatedAt: Date;
  updatedBy?: mongoose.Types.ObjectId;
}

const permissionSchema = new Schema<IPermission>(
  {
    role: { type: String, required: true, unique: true, index: true },
    permissions: { type: [String], required: true },
    updatedBy: { type: Schema.Types.ObjectId },
  },
  { timestamps: true },
);

export const PermissionModel = mongoose.model<IPermission>('Permission', permissionSchema);

// --- INVITATION MODEL ---
export interface IInvitation extends Document {
  email: string;
  role: Role;
  invitedBy: mongoose.Types.ObjectId;
  laboratoryId?: mongoose.Types.ObjectId | null;
  tokenHash: string;
  expiresAt: Date;
  usedAt?: Date | null;
  status: 'pending' | 'accepted' | 'expired';
}

const invitationSchema = new Schema<IInvitation>(
  {
    email: { type: String, required: true, index: true, lowercase: true, trim: true },
    role: { type: String, required: true },
    invitedBy: { type: Schema.Types.ObjectId, required: true },
    laboratoryId: { type: Schema.Types.ObjectId, default: null },
    tokenHash: { type: String, required: true, unique: true },
    expiresAt: { type: Date, required: true, index: { expires: 0 } }, // TTL index
    usedAt: { type: Date, default: null },
    status: { type: String, enum: ['pending', 'accepted', 'expired'], default: 'pending' },
  },
  { timestamps: true },
);

export const InvitationModel = mongoose.model<IInvitation>('Invitation', invitationSchema);
