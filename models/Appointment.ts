import mongoose, { Document, Schema } from 'mongoose';

export interface IAppointment extends Document {
  patient: mongoose.Types.ObjectId;
  session: mongoose.Types.ObjectId;
  doctor: mongoose.Types.ObjectId;
  appointmentDate: Date;
  appointmentTime: string;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  notes?: string;
  cancelReason?: string;
  createdAt: Date;
  updatedAt: Date;
}

const AppointmentSchema = new Schema<IAppointment>(
  {
    patient: {
      type: Schema.Types.ObjectId,
      ref: 'Patient',
      required: [true, 'Patient is required'],
    },
    session: {
      type: Schema.Types.ObjectId,
      ref: 'Session',
      required: [true, 'Session is required'],
    },
    doctor: {
      type: Schema.Types.ObjectId,
      ref: 'Doctor',
      required: [true, 'Doctor is required'],
    },
    appointmentDate: {
      type: Date,
      required: [true, 'Appointment date is required'],
    },
    appointmentTime: {
      type: String,
      required: [true, 'Appointment time is required'],
    },
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'cancelled', 'completed'],
      default: 'pending',
    },
    notes: {
      type: String,
      trim: true,
    },
    cancelReason: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for better query performance
AppointmentSchema.index({ patient: 1, status: 1 });
AppointmentSchema.index({ session: 1 });
AppointmentSchema.index({ doctor: 1, appointmentDate: 1 });
AppointmentSchema.index({ appointmentDate: 1, status: 1 });

export default mongoose.models.Appointment || mongoose.model<IAppointment>('Appointment', AppointmentSchema);

