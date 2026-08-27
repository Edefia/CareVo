import mongoose, { Schema, type Document } from 'mongoose';

export interface ILabService extends Document {
  laboratoryId: mongoose.Types.ObjectId;
  packageId?: mongoose.Types.ObjectId;
  name: string;
  description?: string;
  category: string;
  labPrice: number;
  platformPrice: number;
  turnaroundTime: string;
  approvalStatus: 'PENDING' | 'APPROVED' | 'REJECTED';
  adminComment?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const labServiceSchema = new Schema<ILabService>(
  {
    laboratoryId: {
      type: Schema.Types.ObjectId,
      ref: 'Laboratory',
      required: true,
      index: true,
    },
    packageId: {
      type: Schema.Types.ObjectId,
      ref: 'Package',
      index: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    category: {
      type: String,
      required: true,
      trim: true,
    },
    labPrice: {
      type: Number,
      required: true,
      min: 0,
    },
    platformPrice: {
      type: Number,
      required: true,
      min: 0,
    },
    turnaroundTime: {
      type: String,
      required: true,
      trim: true,
    },
    approvalStatus: {
      type: String,
      enum: ['PENDING', 'APPROVED', 'REJECTED'],
      default: 'PENDING',
    },
    adminComment: {
      type: String,
      trim: true,
      default: null,
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

export const LabServiceModel = mongoose.model<ILabService>('LabService', labServiceSchema);
