import mongoose, { Document, Schema } from 'mongoose';

export interface IDoctor extends Document {
  name: string;
  email: string;
  password: string;
  phone?: string;
  degree: string;
  specialties: mongoose.Types.ObjectId[];
  profileImage?: string;
  bio?: string;
  experience?: number; // years of experience
  
  // Social Media Links (all optional)
  socialMedia?: {
    facebook?: string;
    instagram?: string;
    twitter?: string;
    tiktok?: string;
    linkedin?: string;
  };
  
  // Availability
  isActive: boolean;
  isAvailableForAppointments: boolean;
  
  // Ratings
  rating?: number;
  totalReviews?: number;
  
  createdAt: Date;
  updatedAt: Date;
}

const DoctorSchema = new Schema<IDoctor>(
  {
    name: {
      type: String,
      required: [true, 'Doctor name is required'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      trim: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
    },
    phone: {
      type: String,
      trim: true,
    },
    degree: {
      type: String,
      required: [true, 'Degree is required'],
      trim: true,
    },
    specialties: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Specialty',
        required: true,
      },
    ],
    profileImage: {
      type: String,
      trim: true,
    },
    bio: {
      type: String,
      trim: true,
    },
    experience: {
      type: Number,
      min: 0,
    },
    socialMedia: {
      facebook: { type: String, trim: true },
      instagram: { type: String, trim: true },
      twitter: { type: String, trim: true },
      tiktok: { type: String, trim: true },
      linkedin: { type: String, trim: true },
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    isAvailableForAppointments: {
      type: Boolean,
      default: true,
    },
    rating: {
      type: Number,
      min: 0,
      max: 5,
      default: 0,
    },
    totalReviews: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Index for better query performance
DoctorSchema.index({ email: 1 });
DoctorSchema.index({ specialties: 1 });
DoctorSchema.index({ isActive: 1, isAvailableForAppointments: 1 });

export default mongoose.models.Doctor || mongoose.model<IDoctor>('Doctor', DoctorSchema);

