import mongoose, { Schema, type Document, type Types } from 'mongoose';

export interface ILaboratory extends Document {
  name: string;
  code: string;
  contactEmail: string;
  contactPhone: string;
  address: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  isActive: boolean;
  verifiedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

const laboratorySchema = new Schema<ILaboratory>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    code: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
    },
    contactEmail: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
    contactPhone: {
      type: String,
      required: true,
      trim: true,
    },
    address: {
      street: { type: String, required: true },
      city: { type: String, required: true },
      state: { type: String, required: true },
      zipCode: { type: String, required: true },
      country: { type: String, required: true },
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    verifiedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
laboratorySchema.index({ code: 1 });
laboratorySchema.index({ 'address.city': 1 });

export const LaboratoryModel = mongoose.model<ILaboratory>('Laboratory', laboratorySchema);
