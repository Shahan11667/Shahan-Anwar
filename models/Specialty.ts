import mongoose, { Document, Schema } from 'mongoose';

export interface ISpecialty extends Document {
  name: string;
  description?: string;
  icon?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const SpecialtySchema = new Schema<ISpecialty>(
  {
    name: {
      type: String,
      required: [true, 'Specialty name is required'],
      unique: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    icon: {
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

export default mongoose.models.Specialty || mongoose.model<ISpecialty>('Specialty', SpecialtySchema);

