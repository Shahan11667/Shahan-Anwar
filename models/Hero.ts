import mongoose, { Document, Schema } from 'mongoose';

export interface IHeroFeatureCard {
  title: string;
  description: string;
  icon: string;
}

export interface IHero extends Document {
  badge?: string;
  name: string;
  title: string;
  subtitle: string;
  description: string;
  image: string;
  emergencyPhone?: string;
  featureCards?: IHeroFeatureCard[];
  resumeLink?: string;
  socialLinks?: {
    github?: string;
    linkedin?: string;
    email?: string;
  };
  seoKeywords?: string[];
  seoDescription?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const HeroFeatureCardSchema = new Schema<IHeroFeatureCard>({
  title: { type: String, required: true },
  description: { type: String, required: true },
  icon: { type: String, default: 'Phone' },
});

const HeroSchema = new Schema<IHero>({
  badge: {
    type: String,
    default: 'DOCTOR & CLINIC SERVICES',
    trim: true,
  },
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
  },
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true,
  },
  subtitle: {
    type: String,
    required: [true, 'Subtitle is required'],
    trim: true,
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
    trim: true,
  },
  image: {
    type: String,
    required: [true, 'Image is required'],
    trim: true,
  },
  emergencyPhone: {
    type: String,
    default: '(555) 123-4567',
    trim: true,
  },
  featureCards: [HeroFeatureCardSchema],
  resumeLink: {
    type: String,
    default: '#',
    trim: true,
  },
  socialLinks: {
    github: {
      type: String,
      default: '',
      trim: true,
    },
    linkedin: {
      type: String,
      default: '',
      trim: true,
    },
    email: {
      type: String,
      default: '',
      trim: true,
    },
  },
  seoKeywords: {
    type: [String],
    default: [],
  },
  seoDescription: {
    type: String,
    default: '',
    trim: true,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
}, {
  timestamps: true,
});

export default mongoose.models.Hero || mongoose.model<IHero>('Hero', HeroSchema);

