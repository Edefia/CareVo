import mongoose, { Schema, type Document } from 'mongoose';

export interface IPackage extends Document {
  name: string;
  description: string;
  price: number;
  currency: string;
  features: string[];
  pillarIcon: 'CARDIO' | 'RENAL' | 'METABOLIC' | 'COMPREHENSIVE';
  color: string;
  bgColor: string;
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
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    currency: {
      type: String,
      default: 'GHS',
      required: true,
    },
    features: [
      {
        type: String,
        required: true,
      },
    ],
    pillarIcon: {
      type: String,
      enum: ['CARDIO', 'RENAL', 'METABOLIC', 'COMPREHENSIVE'],
      required: true,
    },
    color: {
      type: String,
      default: 'text-[#DC2626]',
    },
    bgColor: {
      type: String,
      default: 'bg-[#DC2626]/10',
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
