import mongoose, { Document, Schema } from 'mongoose';

export interface ISocialAnalytics {
  likes: number;
  shares: number;
  clicks: number;
  reach: number;
}

export interface ISocialPost extends Document {
  caption: string;
  mediaUrl?: string;
  targetPlatforms: string[];
  profileIds: string[];
  status: 'draft' | 'queued' | 'published' | 'failed';
  scheduledFor?: Date;
  bufferUpdateIds?: string[];
  showOnPortfolio: boolean;
  analytics?: ISocialAnalytics;
  createdAt: Date;
  updatedAt: Date;
}

const SocialAnalyticsSchema = new Schema<ISocialAnalytics>({
  likes: { type: Number, default: 0 },
  shares: { type: Number, default: 0 },
  clicks: { type: Number, default: 0 },
  reach: { type: Number, default: 0 },
});

const SocialPostSchema = new Schema<ISocialPost>(
  {
    caption: {
      type: String,
      required: [true, 'Post caption is required'],
      trim: true,
    },
    mediaUrl: {
      type: String,
      default: '',
      trim: true,
    },
    targetPlatforms: [
      {
        type: String,
        trim: true,
      },
    ],
    profileIds: [
      {
        type: String,
        trim: true,
      },
    ],
    status: {
      type: String,
      enum: ['draft', 'queued', 'published', 'failed'],
      default: 'draft',
    },
    scheduledFor: {
      type: Date,
    },
    bufferUpdateIds: [
      {
        type: String,
      },
    ],
    showOnPortfolio: {
      type: Boolean,
      default: true,
    },
    analytics: {
      type: SocialAnalyticsSchema,
      default: () => ({ likes: 0, shares: 0, clicks: 0, reach: 0 }),
    },
  },
  {
    timestamps: true,
  }
);

SocialPostSchema.index({ createdAt: -1 });
SocialPostSchema.index({ showOnPortfolio: 1, status: 1 });

export default mongoose.models.SocialPost || mongoose.model<ISocialPost>('SocialPost', SocialPostSchema);
