import mongoose, { Schema, type Document, type Types } from 'mongoose';

export interface IPatient extends Document {
  userId: Types.ObjectId;
  laboratoryIds: Types.ObjectId[];
  mrn: string;
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

function generateMRN(): string {
  const digits = Math.floor(10000 + Math.random() * 90000).toString();
  const year = new Date().getFullYear();
  return `DIS-0${digits}/${year}`;
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
    mrn: {
      type: String,
      unique: true,
      sparse: true,
      index: true,
    },
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

// Auto-generate MRN on creation if not already set
patientSchema.pre('save', async function () {
  if (!this.mrn) {
    let mrn = generateMRN();
    // Ensure uniqueness
    let exists = await mongoose.model('Patient').findOne({ mrn });
    while (exists) {
      mrn = generateMRN();
      exists = await mongoose.model('Patient').findOne({ mrn });
    }
    this.mrn = mrn;
  }
});

// Indexes
patientSchema.index({ laboratoryIds: 1 });

export const PatientModel = mongoose.model<IPatient>('Patient', patientSchema);
