import mongoose, { Schema, type Document, type Types } from 'mongoose';

export interface IAdvocacyTaskNote {
  text: string; // Encrypted
  authorId: Types.ObjectId;
  createdAt: Date;
}

export interface IAdvocacyTask extends Document {
  patientId: Types.ObjectId;
  assignedTo: Types.ObjectId | null;
  createdBy: Types.ObjectId;
  title: string;
  description: string | null;
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  dueDate: Date | null;
  notes: IAdvocacyTaskNote[];
  createdAt: Date;
  updatedAt: Date;
}

const advocacyTaskNoteSchema = new Schema<IAdvocacyTaskNote>(
  {
    text: { type: String, required: true },
    authorId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    createdAt: { type: Date, default: Date.now },
  },
  { _id: true }
);

const advocacyTaskSchema = new Schema<IAdvocacyTask>(
  {
    patientId: {
      type: Schema.Types.ObjectId,
      ref: 'Patient',
      required: true,
      index: true,
    },
    assignedTo: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      default: null,
      index: true,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      default: null,
    },
    status: {
      type: String,
      enum: ['PENDING', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'],
      default: 'PENDING',
      index: true,
    },
    priority: {
      type: String,
      enum: ['LOW', 'MEDIUM', 'HIGH', 'URGENT'],
      default: 'MEDIUM',
    },
    dueDate: {
      type: Date,
      default: null,
      index: true,
    },
    notes: [advocacyTaskNoteSchema],
  },
  {
    timestamps: true,
  }
);

export const AdvocacyTaskModel = mongoose.model<IAdvocacyTask>('AdvocacyTask', advocacyTaskSchema);
