import mongoose, { Document, Schema } from 'mongoose';

export interface IMedicalRecord extends Document {
  appointment: mongoose.Types.ObjectId;
  patient: mongoose.Types.ObjectId;
  doctor: mongoose.Types.ObjectId;
  type: 'image' | 'video' | 'pdf' | 'document' | 'note' | 'other';
  title: string;
  description?: string;
  fileUrl?: string;
  textContent?: string;
  notes?: string;
  fileSize?: number;
  mimeType?: string;
  uploadedBy: 'patient' | 'doctor';
  createdAt: Date;
  updatedAt: Date;
}

const MedicalRecordSchema = new Schema<IMedicalRecord>(
  {
    appointment: {
      type: Schema.Types.ObjectId,
      ref: 'Appointment',
      required: [true, 'Appointment is required'],
    },
    patient: {
      type: Schema.Types.ObjectId,
      ref: 'Patient',
      required: [true, 'Patient is required'],
    },
    doctor: {
      type: Schema.Types.ObjectId,
      ref: 'Doctor',
      required: [true, 'Doctor is required'],
    },
    type: {
      type: String,
      enum: ['image', 'video', 'pdf', 'document', 'note', 'other'],
      required: [true, 'Record type is required'],
    },
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    fileUrl: {
      type: String,
      trim: true,
    },
    textContent: {
      type: String,
      trim: true,
    },
    notes: {
      type: String,
      trim: true,
    },
    fileSize: {
      type: Number,
    },
    mimeType: {
      type: String,
      trim: true,
    },
    uploadedBy: {
      type: String,
      enum: ['patient', 'doctor'],
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for better query performance
MedicalRecordSchema.index({ appointment: 1 });
MedicalRecordSchema.index({ patient: 1 });
MedicalRecordSchema.index({ doctor: 1 });
MedicalRecordSchema.index({ type: 1 });

export default mongoose.models.MedicalRecord || mongoose.model<IMedicalRecord>('MedicalRecord', MedicalRecordSchema);

