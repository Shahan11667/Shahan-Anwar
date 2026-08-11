import mongoose, { Document, Schema } from 'mongoose';

export interface IPromise extends Document {
  title: string;
  description: string;
  icon?: string;
  image?: string;
  ctaText?: string;
  ctaLink?: string;
  isActive: boolean;
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

const PromiseSchema = new Schema<IPromise>(
  {
    title: {
      type: String,
      required: [true, 'Promise title is required'],
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      trim: true,
    },
    icon: {
      type: String,
      default: 'HeartHandshake',
      trim: true,
    },
    image: {
      type: String,
      default: '',
      trim: true,
    },
    ctaText: {
      type: String,
      default: 'Learn More',
      trim: true,
    },
    ctaLink: {
      type: String,
      default: '#',
      trim: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    order: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.Promise || mongoose.model<IPromise>('Promise', PromiseSchema);
