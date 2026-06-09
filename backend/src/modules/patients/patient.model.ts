import mongoose, { Schema, type Document, type Types } from 'mongoose';

export interface IPatient extends Document {
  userId: Types.ObjectId;
  laboratoryIds: Types.ObjectId[];
  dateOfBirth: Date | null;
  gender: string;
  bloodType: string;
  address: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  } | null;
  emergencyContact: {
    name: string;
    relationship: string;
    phone: string;
  } | null;
  allergies: string[];
  medicalHistory: string[];
  createdAt: Date;
  updatedAt: Date;
}

const patientSchema = new Schema<IPatient>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true, // 1-to-1 relationship with User
    },
    laboratoryIds: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Laboratory',
      },
    ],
    dateOfBirth: {
      type: Date,
      default: null,
    },
    gender: {
      type: String,
      enum: ['Male', 'Female', 'Other', 'Unknown'],
      default: 'Unknown',
    },
    bloodType: {
      type: String,
      enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-', 'Unknown'],
      default: 'Unknown',
    },
    address: {
      street: { type: String },
      city: { type: String },
      state: { type: String },
      zipCode: { type: String },
      country: { type: String },
    },
    emergencyContact: {
      name: { type: String },
      relationship: { type: String },
      phone: { type: String },
    },
    allergies: [
      {
        type: String,
      },
    ],
    medicalHistory: [
      {
        type: String,
      },
    ],
  },
  {
    timestamps: true,
  }
);

// Indexes
patientSchema.index({ laboratoryIds: 1 });

export const PatientModel = mongoose.model<IPatient>('Patient', patientSchema);
