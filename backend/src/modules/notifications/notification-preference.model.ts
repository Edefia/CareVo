import mongoose, { Schema, type Document, type Types } from 'mongoose';

export interface INotificationPreference extends Document {
  userId: Types.ObjectId;
  emailEnabled: boolean;
  smsEnabled: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const notificationPreferenceSchema = new Schema<INotificationPreference>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    emailEnabled: {
      type: Boolean,
      default: true,
    },
    smsEnabled: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

export const NotificationPreferenceModel = mongoose.model<INotificationPreference>(
  'NotificationPreference',
  notificationPreferenceSchema
);
