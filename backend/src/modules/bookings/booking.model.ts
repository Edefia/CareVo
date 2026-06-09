import mongoose, { Schema, type Document, type Types } from 'mongoose';

export interface IBooking extends Document {
  patientId: Types.ObjectId;
  staffId: Types.ObjectId | null;
  status: 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED';
  scheduledAt: Date;
  durationMinutes: number;
  reason: string;
  meetingLink: string | null;
  internalNotes: string | null; // Encrypted
  createdAt: Date;
  updatedAt: Date;
}

const bookingSchema = new Schema<IBooking>(
  {
    patientId: {
      type: Schema.Types.ObjectId,
      ref: 'Patient',
      required: true,
      index: true,
    },
    staffId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      default: null,
      index: true,
    },
    status: {
      type: String,
      enum: ['PENDING', 'CONFIRMED', 'CANCELLED', 'COMPLETED'],
      default: 'PENDING',
      index: true,
    },
    scheduledAt: {
      type: Date,
      required: true,
      index: true,
    },
    durationMinutes: {
      type: Number,
      required: true,
      default: 30,
    },
    reason: {
      type: String,
      required: true,
    },
    meetingLink: {
      type: String,
      default: null,
    },
    internalNotes: {
      type: String, // Encrypted AES-256-GCM
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

export const BookingModel = mongoose.model<IBooking>('Booking', bookingSchema);
