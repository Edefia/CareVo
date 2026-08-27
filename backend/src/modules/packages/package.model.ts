import mongoose, { Schema, type Document } from 'mongoose';

export interface IPackage extends Document {
  name: string;
  description: string;
  category: string;
  testsIncluded: string[];
  turnaroundTime?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const packageSchema = new Schema<IPackage>(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      required: true,
      trim: true,
    },
    testsIncluded: [
      {
        type: String,
      },
    ],
    turnaroundTime: {
      type: String,
      trim: true,
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

export const PackageModel = mongoose.model<IPackage>('Package', packageSchema);
