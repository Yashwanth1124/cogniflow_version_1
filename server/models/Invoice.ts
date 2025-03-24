import mongoose, { Document, Schema } from 'mongoose';
import { Invoice as InvoiceType } from '../../shared/schema';

export interface InvoiceDocument extends Document, Omit<InvoiceType, 'id'> {
  _id: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const invoiceSchema = new Schema<InvoiceDocument>(
  {
    invoiceNumber: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    clientName: {
      type: String,
      required: true,
      trim: true,
    },
    clientContact: {
      type: String,
      trim: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    tax: {
      type: Number,
      default: 0,
    },
    currency: {
      type: String,
      required: true,
      default: 'USD',
    },
    status: {
      type: String,
      required: true,
      enum: ['pending', 'paid', 'overdue', 'cancelled'],
      default: 'pending',
    },
    type: {
      type: String,
      required: true,
      enum: ['accounts_receivable', 'accounts_payable'],
    },
    issueDate: {
      type: Date,
      required: true,
      default: Date.now,
    },
    dueDate: {
      type: Date,
      required: true,
    },
    paymentTerms: {
      type: String,
      trim: true,
    },
    notes: {
      type: String,
      trim: true,
    },
    items: {
      type: [{
        description: String,
        quantity: Number,
        unitPrice: Number,
        amount: Number,
      }],
      default: [],
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
invoiceSchema.index({ invoiceNumber: 1 });
invoiceSchema.index({ type: 1, status: 1 });
invoiceSchema.index({ clientName: 1 });
invoiceSchema.index({ dueDate: 1, status: 1 });
invoiceSchema.index({ issueDate: -1 });
invoiceSchema.index({ createdBy: 1 });

const Invoice = mongoose.model<InvoiceDocument>('Invoice', invoiceSchema);

export default Invoice;