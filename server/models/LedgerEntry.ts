import mongoose, { Document, Schema } from 'mongoose';
import { LedgerEntry as LedgerEntryType } from '../../shared/schema';

export interface LedgerEntryDocument extends Document, Omit<LedgerEntryType, 'id'> {
  _id: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const ledgerEntrySchema = new Schema<LedgerEntryDocument>(
  {
    entryNumber: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    date: {
      type: Date,
      required: true,
      default: Date.now,
    },
    accountName: {
      type: String,
      required: true,
      trim: true,
    },
    debit: {
      type: Number,
      default: 0,
    },
    credit: {
      type: Number,
      default: 0,
    },
    balance: {
      type: Number,
      default: 0,
    },
    transactionId: {
      type: Schema.Types.ObjectId,
      ref: 'Transaction',
    },
    reference: {
      type: String,
      trim: true,
    },
    notes: {
      type: String,
      trim: true,
    },
    createdBy: {
      type: Number,
      required: true,
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform: (_, ret) => {
        ret.id = ret._id;
        delete ret._id;
        delete ret.__v;
        return ret;
      },
    },
  }
);

// Index for faster queries
ledgerEntrySchema.index({ entryNumber: 1 });
ledgerEntrySchema.index({ accountName: 1 });
ledgerEntrySchema.index({ date: -1 });
ledgerEntrySchema.index({ transactionId: 1 });
ledgerEntrySchema.index({ createdBy: 1 });

const LedgerEntry = mongoose.model<LedgerEntryDocument>('LedgerEntry', ledgerEntrySchema);

export default LedgerEntry;