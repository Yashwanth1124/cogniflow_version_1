import mongoose, { Document, Schema } from 'mongoose';
import { Account as AccountType } from '../../shared/schema';

export interface AccountDocument extends Document {
  name: string;
  type: string;
  code: string;
  description?: string;
  balance: number;
  currency: string;
  isActive: boolean;
  parentAccount?: mongoose.Types.ObjectId;
  notes?: string;
  createdBy: number;
  createdAt: Date;
  updatedAt: Date;
}

const accountSchema = new Schema<AccountDocument>(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    type: {
      type: String,
      required: true,
      enum: ['asset', 'liability', 'equity', 'revenue', 'expense'],
    },
    code: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    balance: {
      type: Number,
      default: 0,
    },
    currency: {
      type: String,
      required: true,
      default: 'USD',
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    parentAccount: {
      type: Schema.Types.ObjectId,
      ref: 'Account',
      default: null,
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
accountSchema.index({ name: 1 });
accountSchema.index({ code: 1 });
accountSchema.index({ type: 1 });
accountSchema.index({ parentAccount: 1 });
accountSchema.index({ isActive: 1 });

const Account = mongoose.model<AccountDocument>('Account', accountSchema);

export default Account;