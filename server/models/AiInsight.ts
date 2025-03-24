import mongoose, { Document, Schema } from 'mongoose';
import { AiInsight as AiInsightType } from '../../shared/schema';

export interface AiInsightDocument extends Document, Omit<AiInsightType, 'id'> {
  _id: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const aiInsightSchema = new Schema<AiInsightDocument>(
  {
    type: {
      type: String,
      required: true,
      enum: ['anomaly', 'prediction', 'recommendation', 'optimization'],
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    severity: {
      type: String,
      required: true,
      enum: ['info', 'warning', 'critical'],
      default: 'info',
    },
    relatedData: {
      type: Schema.Types.Mixed,
      default: null,
    },
    relatedEntityType: {
      type: String,
      trim: true,
    },
    relatedEntityId: {
      type: Schema.Types.Mixed,
    },
    isRead: {
      type: Boolean,
      default: false,
    },
    timestamp: {
      type: Date,
      required: true,
      default: Date.now,
    },
    expiresAt: {
      type: Date,
    },
    ctaText: {
      type: String,
      trim: true,
    },
    ctaLink: {
      type: String,
      trim: true,
    },
    userId: {
      type: Number,
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
aiInsightSchema.index({ type: 1 });
aiInsightSchema.index({ severity: 1 });
aiInsightSchema.index({ isRead: 1 });
aiInsightSchema.index({ relatedEntityType: 1, relatedEntityId: 1 });
aiInsightSchema.index({ timestamp: -1 });
aiInsightSchema.index({ userId: 1 });

const AiInsight = mongoose.model<AiInsightDocument>('AiInsight', aiInsightSchema);

export default AiInsight;