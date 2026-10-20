import mongoose, { Schema, type Document, type Types } from 'mongoose';

// ─── Follow-Up Types ────────────────────────────────────────────────────────
export type FollowUpType =
  | 'FURTHER_TESTING'
  | 'MEDICATION_REFERRAL'
  | 'CLINICIAN_APPOINTMENT'
  | 'FACILITY_TRANSFER';

export type FollowUpUrgency = 'ROUTINE' | 'URGENT' | 'EMERGENCY';

export type FollowUpStatus =
  | 'PENDING'
  | 'ACKNOWLEDGED'
  | 'IN_PROGRESS'
  | 'COMPLETED'
  | 'CLOSED';

// ─── Follow-Up Interface ────────────────────────────────────────────────────
// A Follow-Up is created by an Interpreter (or Admin) when a client's result
// is high-risk or has abnormal parameters requiring further action. The client
// receives and acknowledges these follow-ups through their dashboard.

export interface IFollowUp extends Document {
  clientId: Types.ObjectId;
  resultId: Types.ObjectId;
  interpretationId: Types.ObjectId;
  interpreterId: Types.ObjectId;
  type: FollowUpType;
  urgency: FollowUpUrgency;
  facility: string | null;
  notes: string;
  status: FollowUpStatus;
  acknowledgedAt: Date | null;
  completedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

const followUpSchema = new Schema<IFollowUp>(
  {
    clientId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    resultId: {
      type: Schema.Types.ObjectId,
      ref: 'ResultRecord',
      required: true,
      index: true,
    },
    interpretationId: {
      type: Schema.Types.ObjectId,
      ref: 'Interpretation',
      required: true,
    },
    interpreterId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    type: {
      type: String,
      enum: [
        'FURTHER_TESTING',
        'MEDICATION_REFERRAL',
        'CLINICIAN_APPOINTMENT',
        'FACILITY_TRANSFER',
      ],
      required: true,
    },
    urgency: {
      type: String,
      enum: ['ROUTINE', 'URGENT', 'EMERGENCY'],
      required: true,
      default: 'ROUTINE',
    },
    facility: {
      type: String,
      trim: true,
      default: null,
    },
    notes: {
      type: String,
      required: true,
      maxlength: 800,
    },
    status: {
      type: String,
      enum: ['PENDING', 'ACKNOWLEDGED', 'IN_PROGRESS', 'COMPLETED', 'CLOSED'],
      default: 'PENDING',
      index: true,
    },
    acknowledgedAt: {
      type: Date,
      default: null,
    },
    completedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for client dashboard queries — sort by urgency priority then date
followUpSchema.index({ clientId: 1, status: 1, createdAt: -1 });
followUpSchema.index({ interpreterId: 1, createdAt: -1 });
followUpSchema.index({ urgency: 1 });

export const FollowUpModel = mongoose.model<IFollowUp>('FollowUp', followUpSchema);
