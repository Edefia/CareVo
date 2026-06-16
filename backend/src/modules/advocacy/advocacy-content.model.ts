import mongoose, { Schema, type Document, type Types } from 'mongoose';

export interface IAdvocacyContent extends Document {
  title: string;
  type: 'EDUCATION_CARD' | 'PREVENTIVE_TIP';
  category: string;
  content: string;
  imageUrl?: string;
  authorId: Types.ObjectId;
  status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
  createdAt: Date;
  updatedAt: Date;
}

const advocacyContentSchema = new Schema<IAdvocacyContent>(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    type: {
      type: String,
      enum: ['EDUCATION_CARD', 'PREVENTIVE_TIP'],
      required: true,
      index: true,
    },
    category: {
      type: String,
      required: true,
      index: true,
    },
    content: {
      type: String,
      required: true,
    },
    imageUrl: {
      type: String,
    },
    authorId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    status: {
      type: String,
      enum: ['DRAFT', 'PUBLISHED', 'ARCHIVED'],
      default: 'DRAFT',
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

export const AdvocacyContentModel = mongoose.model<IAdvocacyContent>('AdvocacyContent', advocacyContentSchema);
