import mongoose, { Document, Schema } from 'mongoose';

export interface ITestimonial extends Document {
  patientName: string;
  patientRole?: string;
  avatar?: string;
  rating: number;
  quote: string;
  isActive: boolean;
  isFeatured: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const TestimonialSchema = new Schema<ITestimonial>(
  {
    patientName: {
      type: String,
      required: [true, 'Patient name is required'],
      trim: true,
    },
    patientRole: {
      type: String,
      default: 'Verified Patient',
      trim: true,
    },
    avatar: {
      type: String,
      default: '',
      trim: true,
    },
    rating: {
      type: Number,
      default: 5,
      min: 1,
      max: 5,
    },
    quote: {
      type: String,
      required: [true, 'Quote is required'],
      trim: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    isFeatured: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.Testimonial || mongoose.model<ITestimonial>('Testimonial', TestimonialSchema);
