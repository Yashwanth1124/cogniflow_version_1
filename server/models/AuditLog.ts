import mongoose, { Document, Schema } from 'mongoose';
import { AuditLog as AuditLogType } from '../../shared/schema';

export interface AuditLogDocument extends Document {
  userId: number;
  action: string;
  entityType: string;
  entityId?: number;
  details?: any;
  createdAt: Date;
  updatedAt: Date;
}

const auditLogSchema = new Schema<AuditLogDocument>(
  {
    action: {
      type: String,
      required: true,
      enum: ['create', 'update', 'delete', 'login', 'logout', 'other'],
    },
    entityType: {
      type: String,
      required: true,
      trim: true,
    },
    entityId: {
      type: Schema.Types.Mixed,
      required: true,
    },
    details: {
      type: Schema.Types.Mixed,
      default: null,
    },
    userId: {
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
auditLogSchema.index({ action: 1 });
auditLogSchema.index({ entityType: 1, entityId: 1 });
auditLogSchema.index({ userId: 1 });
auditLogSchema.index({ timestamp: -1 });

const AuditLog = mongoose.model<AuditLogDocument>('AuditLog', auditLogSchema);

export default AuditLog;