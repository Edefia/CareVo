import mongoose, { Schema, type Document, type Types } from 'mongoose';

export interface IBiomarker {
  name: string;
  value: number;
  unit: string;
  referenceRange: string;
  flag: 'NORMAL' | 'LOW' | 'HIGH' | 'CRITICAL';
}

export interface IResultRecord extends Document {
  bookingId: Types.ObjectId;
  referralCode: string;
  patientId: Types.ObjectId;
  laboratoryId: Types.ObjectId;
  enteredById: Types.ObjectId;
  collectionDate: Date;
  status: 'DRAFT' | 'FINAL' | 'AMENDED' | 'CANCELLED';
  panelName: string;
  biomarkers: IBiomarker[];
  notes: string | null; // This will store ciphertext
  createdAt: Date;
  updatedAt: Date;
}

const biomarkerSchema = new Schema<IBiomarker>(
  {
    name: { type: String, required: true },
    value: { type: Number, required: true },
    unit: { type: String, required: true },
    referenceRange: { type: String, required: true },
    flag: {
      type: String,
      enum: ['NORMAL', 'LOW', 'HIGH', 'CRITICAL'],
      required: true,
      default: 'NORMAL',
    },
  },
  { _id: false }
);

const resultRecordSchema = new Schema<IResultRecord>(
  {
    bookingId: {
      type: Schema.Types.ObjectId,
      ref: 'Booking',
      required: true,
      index: true,
    },
    referralCode: {
      type: String,
      required: true,
      index: true,
    },
    patientId: {
      type: Schema.Types.ObjectId,
      ref: 'Patient',
      required: true,
    },
    laboratoryId: {
      type: Schema.Types.ObjectId,
      ref: 'Laboratory',
      required: true,
    },
    enteredById: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    collectionDate: {
      type: Date,
      required: true,
    },
    status: {
      type: String,
      enum: ['DRAFT', 'FINAL', 'AMENDED', 'CANCELLED'],
      default: 'DRAFT',
    },
    panelName: {
      type: String,
      required: true,
    },
    biomarkers: [biomarkerSchema],
    notes: {
      type: String, // Will hold encrypted AES-256-GCM string: iv:authTag:ciphertext
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
resultRecordSchema.index({ patientId: 1, status: 1 });
resultRecordSchema.index({ laboratoryId: 1 });
resultRecordSchema.index({ collectionDate: -1 });

export const ResultRecordModel = mongoose.model<IResultRecord>('ResultRecord', resultRecordSchema);
