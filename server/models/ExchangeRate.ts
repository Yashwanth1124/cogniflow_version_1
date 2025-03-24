import mongoose, { Document, Schema } from 'mongoose';
import { ExchangeRate as ExchangeRateType } from '../../shared/schema';

export interface ExchangeRateDocument extends Document, Omit<ExchangeRateType, 'id'> {
  _id: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const exchangeRateSchema = new Schema<ExchangeRateDocument>(
  {
    baseCurrency: {
      type: String,
      required: true,
      trim: true,
    },
    targetCurrency: {
      type: String,
      required: true,
      trim: true,
    },
    rate: {
      type: Number,
      required: true,
    },
    date: {
      type: Date,
      required: true,
      default: Date.now,
    },
    source: {
      type: String,
      trim: true,
      default: 'manual',
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

// Create a compound index for base and target currency pair
exchangeRateSchema.index({ baseCurrency: 1, targetCurrency: 1, date: -1 });
exchangeRateSchema.index({ date: -1 });

const ExchangeRate = mongoose.model<ExchangeRateDocument>('ExchangeRate', exchangeRateSchema);

export default ExchangeRate;