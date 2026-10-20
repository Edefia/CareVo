import mongoose, { Schema, type Document, type Types } from 'mongoose';

// ─── Health Account Entry Interface ─────────────────────────────────────────
// Each entry represents a single biomarker data point exported by a client
// from their results into their personal Health Account for trend tracking.

export interface IHealthAccountEntry extends Document {
  clientId: Types.ObjectId;
  sourceResultId: Types.ObjectId;
  parameterName: string;
  parameterKey: string;
  pillar: 'CARDIO' | 'RENAL' | 'METABOLIC';
  value: string;
  unit: string;
  referenceMin: number | null;
  referenceMax: number | null;
  testDate: Date;
  laboratoryId: Types.ObjectId;
  laboratoryName: string;
  exportedAt: Date;
  createdAt: Date;
}

const healthAccountEntrySchema = new Schema<IHealthAccountEntry>(
  {
    clientId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    sourceResultId: {
      type: Schema.Types.ObjectId,
      ref: 'ResultRecord',
      required: true,
      index: true,
    },
    parameterName: {
      type: String,
      required: true,
      trim: true,
    },
    parameterKey: {
      type: String,
      required: true,
      uppercase: true,
      trim: true,
    },
    pillar: {
      type: String,
      enum: ['CARDIO', 'RENAL', 'METABOLIC'],
      required: true,
    },
    value: {
      type: String,
      required: true,
    },
    unit: {
      type: String,
      required: true,
    },
    referenceMin: {
      type: Number,
      default: null,
    },
    referenceMax: {
      type: Number,
      default: null,
    },
    testDate: {
      type: Date,
      required: true,
    },
    laboratoryId: {
      type: Schema.Types.ObjectId,
      ref: 'Laboratory',
      required: true,
    },
    laboratoryName: {
      type: String,
      required: true,
      trim: true,
    },
    exportedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Compound indexes for efficient querying
healthAccountEntrySchema.index({ clientId: 1, parameterKey: 1, testDate: 1 });
healthAccountEntrySchema.index({ clientId: 1, exportedAt: -1 });
// Prevent duplicate exports of the same parameter from the same result
healthAccountEntrySchema.index(
  { clientId: 1, sourceResultId: 1, parameterKey: 1 },
  { unique: true }
);

export const HealthAccountEntryModel = mongoose.model<IHealthAccountEntry>(
  'HealthAccountEntry',
  healthAccountEntrySchema
);
