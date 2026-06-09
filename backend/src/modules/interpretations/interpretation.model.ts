import mongoose, { Schema, type Document, type Types } from 'mongoose';

export interface IInterpretation extends Document {
  resultId: Types.ObjectId;
  patientId: Types.ObjectId;
  interpreterId: Types.ObjectId;
  status: 'DRAFT' | 'PUBLISHED';
  summary: string;
  clinicalNotes: string | null; // Encrypted
  recommendations: string | null; // Encrypted
  createdAt: Date;
  updatedAt: Date;
}

const interpretationSchema = new Schema<IInterpretation>(
  {
    resultId: {
      type: Schema.Types.ObjectId,
      ref: 'ResultRecord',
      required: true,
      unique: true, // 1-to-1 relationship with ResultRecord
    },
    patientId: {
      type: Schema.Types.ObjectId,
      ref: 'Patient',
      required: true,
      index: true,
    },
    interpreterId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    status: {
      type: String,
      enum: ['DRAFT', 'PUBLISHED'],
      default: 'DRAFT',
    },
    summary: {
      type: String,
      required: true,
    },
    clinicalNotes: {
      type: String, // Encrypted AES-256-GCM
      default: null,
    },
    recommendations: {
      type: String, // Encrypted AES-256-GCM
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

export const InterpretationModel = mongoose.model<IInterpretation>('Interpretation', interpretationSchema);
