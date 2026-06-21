import mongoose, { Schema, type Document, type Types } from 'mongoose';

export interface INotification extends Document {
  recipientId: Types.ObjectId;
  title: string;
  message: string;
  type: string;
  isRead: boolean;
  readAt?: Date;
  metadata?: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}

const notificationSchema = new Schema<INotification>(
  {
    recipientId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    message: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      default: 'SYSTEM', // e.g., 'SYSTEM', 'BROADCAST', 'RESULT_READY', 'BOOKING_UPDATE'
    },
    isRead: {
      type: Boolean,
      default: false,
    },
    readAt: {
      type: Date,
    },
    metadata: {
      type: Schema.Types.Mixed,
    },
  },
  {
    timestamps: true,
  }
);

export const NotificationModel = mongoose.model<INotification>('Notification', notificationSchema);
