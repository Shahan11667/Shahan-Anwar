import mongoose, { Document, Schema } from 'mongoose';

export interface ISession extends Document {
  doctor: mongoose.Types.ObjectId;
  specialty: mongoose.Types.ObjectId;
  hospital: string;
  floor: string;
  room: string;
  date: Date;
  
  startTime: string; // HH:mm format (e.g., "09:00")
  endTime: string; // HH:mm format (e.g., "17:00")
  description?: string;
  images?: string[]; // Array of image URLs
  isActive: boolean;
  maxAppointments?: number;
  bookedAppointments?: number;
  createdBy: mongoose.Types.ObjectId; // Admin who created it
  createdAt: Date;
  updatedAt: Date;
}

const SessionSchema = new Schema<ISession>(
  {
    doctor: {
      type: Schema.Types.ObjectId,
      ref: 'Doctor',
      required: [true, 'Doctor is required'],
    },
    specialty: {
      type: Schema.Types.ObjectId,
      ref: 'Specialty',
      required: [true, 'Specialty is required'],
    },
    hospital: {
      type: String,
      required: [true, 'Hospital name is required'],
      trim: true,
    },
    floor: {
      type: String,
      required: [true, 'Floor is required'],
      trim: true,
    },
    room: {
      type: String,
      required: [true, 'Room number is required'],
      trim: true,
    },
    date: {
      type: Date,
      required: [true, 'Session date is required'],
    },
    startTime: {
      type: String,
      required: [true, 'Start time is required'],
      trim: true,
    },
    endTime: {
      type: String,
      required: [true, 'End time is required'],
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    images: {
      type: [String],
      default: [],
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    maxAppointments: {
      type: Number,
      default: 20,
    },
    bookedAppointments: {
      type: Number,
      default: 0,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'Admin',
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Index for better query performance
SessionSchema.index({ doctor: 1, date: 1 });
SessionSchema.index({ specialty: 1, date: 1 });
SessionSchema.index({ date: 1, isActive: 1 });
SessionSchema.index({ hospital: 1 });

export default mongoose.models.Session || mongoose.model<ISession>('Session', SessionSchema);

