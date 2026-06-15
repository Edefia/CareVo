import mongoose, { Schema, type Document, type Types } from 'mongoose';

export interface IInvoice extends Document {
  patientId: Types.ObjectId;
  issuedBy: Types.ObjectId;
  amount: number; // Stored in smallest currency unit (e.g., cents)
  currency: string;
  status: 'PENDING' | 'PAID' | 'CANCELLED' | 'REFUNDED';
  description: string;
  referenceId: string | null;
  paymentGateway: 'PAYSTACK' | 'FLUTTERWAVE' | 'HUBTEL' | 'MANUAL' | null;
  paidAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

const invoiceSchema = new Schema<IInvoice>(
  {
    patientId: {
      type: Schema.Types.ObjectId,
      ref: 'Patient',
      required: true,
      index: true,
    },
    issuedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    currency: {
      type: String,
      required: true,
      uppercase: true,
      trim: true,
      default: 'GHS',
    },
    status: {
      type: String,
      enum: ['PENDING', 'PAID', 'CANCELLED', 'REFUNDED'],
      default: 'PENDING',
      index: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    referenceId: {
      type: String,
      default: null,
      index: true, // Used for quick webhook lookup
    },
    paymentGateway: {
      type: String,
      enum: ['PAYSTACK', 'FLUTTERWAVE', 'HUBTEL', 'MANUAL', null],
      default: null,
    },
    paidAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

export const InvoiceModel = mongoose.model<IInvoice>('Invoice', invoiceSchema);
