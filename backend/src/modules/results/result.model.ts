import mongoose, { Schema, type Document, type Types } from 'mongoose';

export interface IBiomarker {
  name: string;
  value: number;
  unit: string;
  referenceRange: string;
  flag: 'NORMAL' | 'LOW' | 'HIGH' | 'CRITICAL';
  interpretation?: string;
  reportingType?: string;
  resultStatus?: 'PENDING' | 'ENTERED' | 'VERIFIED';
  positiveNegative?: 'POSITIVE' | 'NEGATIVE' | null;
}

export interface IActivityLogEntry {
  action: string;
  userId: Types.ObjectId;
  userName: string;
  timestamp: Date;
  details?: string;
}

export interface IResultRecord extends Document {
  bookingId: Types.ObjectId;
  referralCode: string;
  placementId: string;
  patientId: Types.ObjectId;
  laboratoryId: Types.ObjectId;
  enteredById: Types.ObjectId;
  orderedById: Types.ObjectId | null;
  orderedFrom: string | null;
  sampleApprovedById: Types.ObjectId | null;
  sampleApprovedTime: Date | null;
  signed: boolean;
  signedById: Types.ObjectId | null;
  signedAt: Date | null;
  collectionDate: Date;
  status: 'DRAFT' | 'FINAL' | 'AMENDED' | 'CANCELLED';
  testStatus: 'PENDING' | 'PARTIAL' | 'COMPLETE';
  panelName: string;
  panelType: 'PROFILE' | 'TEST';
  biomarkers: IBiomarker[];
  notes: string | null; // This will store ciphertext
  laboratoryFindings: string | null;
  activityLog: IActivityLogEntry[];
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
    interpretation: {
      type: String,
      default: null,
    },
    reportingType: {
      type: String,
      default: 'Manual',
    },
    resultStatus: {
      type: String,
      enum: ['PENDING', 'ENTERED', 'VERIFIED'],
      default: 'PENDING',
    },
    positiveNegative: {
      type: String,
      enum: ['POSITIVE', 'NEGATIVE', null],
      default: null,
    },
  },
  { _id: false }
);

const activityLogEntrySchema = new Schema<IActivityLogEntry>(
  {
    action: { type: String, required: true },
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    userName: { type: String, required: true },
    timestamp: { type: Date, default: Date.now },
    details: { type: String, default: null },
  },
  { _id: false }
);

function generatePlacementId(labCode: string): string {
  const seq = Math.floor(1000 + Math.random() * 9000).toString();
  const year = new Date().getFullYear();
  return `${labCode}-${seq}/${year}`;
}

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
    placementId: {
      type: String,
      unique: true,
      sparse: true,
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
    orderedById: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    orderedFrom: {
      type: String,
      trim: true,
      default: null,
    },
    sampleApprovedById: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    sampleApprovedTime: {
      type: Date,
      default: null,
    },
    signed: {
      type: Boolean,
      default: false,
    },
    signedById: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    signedAt: {
      type: Date,
      default: null,
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
    testStatus: {
      type: String,
      enum: ['PENDING', 'PARTIAL', 'COMPLETE'],
      default: 'PENDING',
    },
    panelName: {
      type: String,
      required: true,
    },
    panelType: {
      type: String,
      enum: ['PROFILE', 'TEST'],
      default: 'TEST',
    },
    biomarkers: [biomarkerSchema],
    notes: {
      type: String, // Will hold encrypted AES-256-GCM string: iv:authTag:ciphertext
      default: null,
    },
    laboratoryFindings: {
      type: String,
      default: null,
    },
    activityLog: [activityLogEntrySchema],
  },
  {
    timestamps: true,
  }
);

// Auto-generate placementId before save
resultRecordSchema.pre('save', async function () {
  if (!this.placementId) {
    // Try to get lab code from laboratory
    let labCode = 'CC';
    try {
      const lab = await mongoose.model('Laboratory').findById(this.laboratoryId);
      if (lab && lab.code) {
        labCode = lab.code;
      }
    } catch {
      // fallback to CC
    }
    let placementId = generatePlacementId(labCode);
    let exists = await mongoose.model('ResultRecord').findOne({ placementId });
    while (exists) {
      placementId = generatePlacementId(labCode);
      exists = await mongoose.model('ResultRecord').findOne({ placementId });
    }
    this.placementId = placementId;
  }

  // Auto-add creation activity log entry if new
  if (this.isNew && this.activityLog.length === 0) {
    this.activityLog.push({
      action: 'RESULT_CREATED',
      userId: this.enteredById,
      userName: 'System',
      timestamp: new Date(),
      details: 'Result record created',
    });
  }
});

// Indexes
resultRecordSchema.index({ patientId: 1, status: 1 });
resultRecordSchema.index({ laboratoryId: 1 });
resultRecordSchema.index({ collectionDate: -1 });
resultRecordSchema.index({ testStatus: 1 });

export const ResultRecordModel = mongoose.model<IResultRecord>('ResultRecord', resultRecordSchema);
