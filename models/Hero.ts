import mongoose, { Document, Schema } from 'mongoose';

export interface IHero extends Document {
  name: string;
  title: string;
  subtitle: string;
  description: string;
  image: string;
  resumeLink: string;
  socialLinks: {
    github: string;
    linkedin: string;
    email: string;
  };
  seoKeywords: string[];
  seoDescription: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const HeroSchema = new Schema<IHero>({
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
  resumeLink: {
    type: String,
    required: [true, 'Resume link is required'],
    trim: true,
  },
  socialLinks: {
    github: {
      type: String,
      required: [true, 'GitHub link is required'],
      trim: true,
    },
    linkedin: {
      type: String,
      required: [true, 'LinkedIn link is required'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
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
