import mongoose, { Document, Schema } from 'mongoose';

export interface IPatient extends Document {
  name: string;
  email: string;
  password: string;
  phone: string;
  dateOfBirth?: Date;
  gender?: string;
  address?: string;
  profileImage?: string;
  medicalHistory?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const PatientSchema = new Schema<IPatient>(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
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
      required: [true, 'Phone number is required'],
      trim: true,
    },
    dateOfBirth: {
      type: Date,
    },
    gender: {
      type: String,
      enum: ['male', 'female', 'other'],
    },
    address: {
      type: String,
      trim: true,
    },
    profileImage: {
      type: String,
      trim: true,
    },
    medicalHistory: {
      type: String,
      trim: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Index for better query performance
PatientSchema.index({ email: 1 });
PatientSchema.index({ phone: 1 });

export default mongoose.models.Patient || mongoose.model<IPatient>('Patient', PatientSchema);

