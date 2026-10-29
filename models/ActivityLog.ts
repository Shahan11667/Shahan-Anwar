import mongoose, { Schema, Document } from 'mongoose';

export interface IActivityLog extends Document {
  eventType: 'page_view' | 'tool_use' | 'download' | 'share';
  page: string;
  toolSlug?: string;
  toolName?: string;
  action?: string;
  sessionId: string;
  userAgent?: string;
  device: 'mobile' | 'tablet' | 'desktop' | 'unknown';
  browser: string;
  country?: string;
  city?: string;
  referrer?: string;
  timestamp: Date;
}

const ActivityLogSchema = new Schema<IActivityLog>(
  {
    eventType: {
      type: String,
      enum: ['page_view', 'tool_use', 'download', 'share'],
      required: true,
    },
    page: { type: String, required: true },
    toolSlug: { type: String },
    toolName: { type: String },
    action: { type: String },
    sessionId: { type: String, required: true, index: true },
    userAgent: { type: String },
    device: {
      type: String,
      enum: ['mobile', 'tablet', 'desktop', 'unknown'],
      default: 'unknown',
    },
    browser: { type: String, default: 'unknown' },
    country: { type: String },
    city: { type: String },
    referrer: { type: String },
    timestamp: { type: Date, default: Date.now, index: true },
  },
  { timestamps: false }
);

ActivityLogSchema.index({ timestamp: -1 });
ActivityLogSchema.index({ page: 1, timestamp: -1 });
ActivityLogSchema.index({ toolSlug: 1, timestamp: -1 });

export default mongoose.models.ActivityLog ||
  mongoose.model<IActivityLog>('ActivityLog', ActivityLogSchema);
