import mongoose, { Document, Schema } from 'mongoose';
import { Transaction as TransactionType } from '../../shared/schema';

export interface TransactionDocument extends Document {
  transactionNumber: string;
  description: string;
  amount: number;
  currency: string;
  type: string;
  category: string;
  date: Date;
  status: string;
  createdBy: number;
  createdAt: Date;
  updatedAt: Date;
}

const transactionSchema = new Schema<TransactionDocument>(
  {
    transactionNumber: {
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
    amount: {
      type: Number,
      required: true,
    },
    currency: {
      type: String,
      required: true,
      default: 'USD',
    },
    type: {
      type: String,
      required: true,
      enum: ['income', 'expense', 'transfer', 'adjustment'],
    },
    category: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      required: true,
      enum: ['pending', 'completed', 'cancelled'],
      default: 'pending',
    },
    date: {
      type: Date,
      default: Date.now,
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
transactionSchema.index({ transactionNumber: 1 });
transactionSchema.index({ type: 1, date: -1 });
transactionSchema.index({ category: 1, date: -1 });
transactionSchema.index({ status: 1 });
transactionSchema.index({ createdBy: 1 });

const Transaction = mongoose.model<TransactionDocument>('Transaction', transactionSchema);

export default Transaction;