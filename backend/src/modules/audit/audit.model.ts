// @ts-nocheck
import mongoose, { Schema, type Document } from 'mongoose';

export interface IAuditLog extends Document {
  actorId: mongoose.Types.ObjectId;
  actorRole: string;
  action: string;
  resourceType: string;
  resourceId: string;
  previousState: Record<string, unknown> | null;
  newState: Record<string, unknown> | null;
  ipAddress: string;
  userAgent: string;
  sessionId: string;
  timestamp: Date;
  success: boolean;
  failureReason: string | null;
}

const auditLogSchema = new Schema<IAuditLog>(
  {
    actorId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    actorRole: { type: String, required: true },
    action: { type: String, required: true, index: true },
    resourceType: { type: String, required: true },
    resourceId: { type: String, required: true },
    previousState: { type: Schema.Types.Mixed, default: null },
    newState: { type: Schema.Types.Mixed, default: null },
    ipAddress: { type: String, required: true },
    userAgent: { type: String, required: true },
    sessionId: { type: String, required: true },
    timestamp: { type: Date, default: Date.now, index: true },
    success: { type: Boolean, required: true },
    failureReason: { type: String, default: null },
  },
  {
    // No updatedAt — audit logs are immutable
    timestamps: false,
    // Prevent updates and deletes at the schema level
    strict: true,
  },
);

// Compound index for resource lookups
auditLogSchema.index({ resourceType: 1, resourceId: 1 });

// CRITICAL: Remove update and delete methods to enforce write-only
auditLogSchema.statics.findOneAndUpdate = undefined;
auditLogSchema.statics.findOneAndDelete = undefined;
auditLogSchema.statics.updateOne = undefined;
auditLogSchema.statics.updateMany = undefined;
auditLogSchema.statics.deleteOne = undefined;
auditLogSchema.statics.deleteMany = undefined;
auditLogSchema.statics.findByIdAndUpdate = undefined;
auditLogSchema.statics.findByIdAndDelete = undefined;

export const AuditLogModel = mongoose.model<IAuditLog>('AuditLog', auditLogSchema);
