import mongoose, { Document, Schema } from 'mongoose';

export interface IQualification extends Document {
  type: 'awards' | 'certifications' | 'qualifications';
  title: string;
  institution: string;
  year: string;
  description?: string;
  isActive: boolean;
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

const QualificationSchema = new Schema<IQualification>(
  {
    type: {
      type: String,
      enum: ['awards', 'certifications', 'qualifications'],
      required: [true, 'Qualification type is required'],
      default: 'qualifications',
    },
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
    },
    institution: {
      type: String,
      required: [true, 'Institution/Organization is required'],
      trim: true,
    },
    year: {
      type: String,
      required: [true, 'Year is required'],
      trim: true,
    },
    description: {
      type: String,
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

export default mongoose.models.Qualification || mongoose.model<IQualification>('Qualification', QualificationSchema);
