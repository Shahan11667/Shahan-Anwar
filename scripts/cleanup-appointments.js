const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');

// Try to find and load .env file
const possibleEnvFiles = ['.env.local', '.env', '.env.development.local', '.env.development'];
let envLoaded = false;

for (const envFile of possibleEnvFiles) {
  const envPath = path.resolve(process.cwd(), envFile);
  if (fs.existsSync(envPath)) {
    require('dotenv').config({ path: envPath });
    console.log(`📄 Loaded environment from: ${envFile}`);
    envLoaded = true;
    break;
  }
}

if (!envLoaded) {
  console.warn('⚠️  No .env file found. Make sure MONGODB_URI is set in your environment.');
}

// Session Schema (needed for populate)
const SessionSchema = new mongoose.Schema(
  {
    doctor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Doctor',
      required: true,
    },
    specialty: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Specialty',
      required: true,
    },
    hospital: String,
    floor: String,
    room: String,
    date: Date,
    startTime: String,
    endTime: String,
    description: String,
    images: [String],
    isActive: Boolean,
    maxAppointments: Number,
    bookedAppointments: Number,
    createdBy: mongoose.Schema.Types.ObjectId,
  },
  { timestamps: true }
);

const Session = mongoose.models.Session || mongoose.model('Session', SessionSchema);

// Appointment Schema
const AppointmentSchema = new mongoose.Schema(
  {
    patient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Patient',
      required: true,
    },
    session: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Session',
      required: true,
    },
    doctor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Doctor',
      required: true,
    },
    appointmentDate: {
      type: Date,
      required: true,
    },
    appointmentTime: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'cancelled', 'completed'],
      default: 'pending',
    },
    notes: String,
    cancelReason: String,
  },
  { timestamps: true }
);

const Appointment = mongoose.models.Appointment || mongoose.model('Appointment', AppointmentSchema);

async function cleanupAppointments() {
  try {
    // Connect to MongoDB
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    // Find all appointments
    const allAppointments = await Appointment.find({});
    console.log(`Found ${allAppointments.length} total appointments\n`);

    let deletedCount = 0;
    let invalidSessions = [];

    // Check each appointment
    for (const appointment of allAppointments) {
      // Try to populate session
      await appointment.populate('session');
      
      // If session is null, the session was deleted
      if (!appointment.session) {
        console.log(`❌ Found appointment with null session: ${appointment._id}`);
        console.log(`   Patient: ${appointment.patient}`);
        console.log(`   Date: ${appointment.appointmentDate}`);
        console.log(`   Status: ${appointment.status}\n`);
        
        invalidSessions.push(appointment._id);
        
        // Delete this appointment
        await Appointment.findByIdAndDelete(appointment._id);
        deletedCount++;
      }
    }

    console.log('\n=== Cleanup Summary ===');
    console.log(`Total appointments checked: ${allAppointments.length}`);
    console.log(`Appointments with null sessions: ${invalidSessions.length}`);
    console.log(`Appointments deleted: ${deletedCount}`);
    console.log('======================\n');

    if (deletedCount > 0) {
      console.log('✅ Cleanup completed successfully!');
      console.log('ℹ️  Deleted appointments had invalid session references (sessions were deleted).');
    } else {
      console.log('✅ No corrupted appointments found. Database is clean!');
    }

    // Disconnect
    await mongoose.disconnect();
    console.log('\n✅ Disconnected from MongoDB');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error cleaning up appointments:', error);
    process.exit(1);
  }
}

cleanupAppointments();

