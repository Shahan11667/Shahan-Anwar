import mongoose, { Document, Schema, Model } from 'mongoose';

export interface ISocialAccount extends Document {
  platform: 'youtube' | 'instagram' | 'tiktok' | 'facebook' | 'twitter';
  accountHandle: string;
  accountName: string;
  channelId?: string;
  avatarUrl?: string;
  accessToken?: string;
  refreshToken?: string;
  tokenExpiresAt?: Date;
  isConnected: boolean;
  metadata?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

const SocialAccountSchema = new Schema<ISocialAccount>(
  {
    platform: {
      type: String,
      required: true,
      enum: ['youtube', 'instagram', 'tiktok', 'facebook', 'twitter'],
      unique: true
    },
    accountHandle: {
      type: String,
      required: true,
      default: ''
    },
    accountName: {
      type: String,
      required: true,
      default: ''
    },
    channelId: {
      type: String,
      default: ''
    },
    avatarUrl: {
      type: String,
      default: ''
    },
    accessToken: {
      type: String,
      default: ''
    },
    refreshToken: {
      type: String,
      default: ''
    },
    tokenExpiresAt: {
      type: Date
    },
    isConnected: {
      type: Boolean,
      default: false
    },
    metadata: {
      type: Schema.Types.Mixed,
      default: {}
    }
  },
  {
    timestamps: true
  }
);

const SocialAccount: Model<ISocialAccount> = 
  mongoose.models.SocialAccount || mongoose.model<ISocialAccount>('SocialAccount', SocialAccountSchema);

export default SocialAccount;

