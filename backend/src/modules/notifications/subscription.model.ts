import mongoose, { Schema, type Document, type Types } from 'mongoose';

export interface ISubscription extends Document {
  subscriberId: Types.ObjectId;
  patientId: Types.ObjectId;
  eventTypes: string[];
  createdAt: Date;
  updatedAt: Date;
}

const subscriptionSchema = new Schema<ISubscription>(
  {
    subscriberId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    patientId: {
      type: Schema.Types.ObjectId,
      ref: 'Patient',
      required: true,
    },
    eventTypes: [
      {
        type: String,
        required: true,
      },
    ],
  },
  {
    timestamps: true,
  }
);

// Compound index to ensure a subscriber only has one subscription per patient
subscriptionSchema.index({ subscriberId: 1, patientId: 1 }, { unique: true });

export const SubscriptionModel = mongoose.model<ISubscription>('Subscription', subscriptionSchema);
