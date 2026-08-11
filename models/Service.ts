import mongoose, { Document, Schema } from 'mongoose';

export interface IService extends Document {
  title: string;
  accentTitle?: string;
  description: string;
  longDescription?: string;
  icon: string;
  category?: string;
  linkText?: string;
  isActive: boolean;
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

const ServiceSchema = new Schema<IService>(
  {
    title: {
      type: String,
      required: [true, 'Service title is required'],
      trim: true,
    },
    accentTitle: {
      type: String,
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      trim: true,
    },
    longDescription: {
      type: String,
      trim: true,
    },
    icon: {
      type: String,
      default: 'Stethoscope',
      trim: true,
    },
    category: {
      type: String,
      default: 'General Practice',
      trim: true,
    },
    linkText: {
      type: String,
      default: 'Read More',
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

export default mongoose.models.Service || mongoose.model<IService>('Service', ServiceSchema);
