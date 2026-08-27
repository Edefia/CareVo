import mongoose, { Schema, type Document } from 'mongoose';

export interface ICategory extends Document {
  name: string;
  slug: string;
  description?: string;
  isActive: boolean;
  appliesTo: string[];
  createdAt: Date;
  updatedAt: Date;
}

const categorySchema = new Schema<ICategory>(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    appliesTo: [
      {
        type: String,
        enum: ['PACKAGES', 'LAB_SERVICES', 'BOOKINGS'],
        default: ['PACKAGES', 'LAB_SERVICES'],
      },
    ],
  },
  {
    timestamps: true,
  }
);

export const CategoryModel = mongoose.model<ICategory>('Category', categorySchema);
