const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: '.env.local' });

// Specialty Schema
const SpecialtySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
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

const Specialty = mongoose.models.Specialty || mongoose.model('Specialty', SpecialtySchema);

// Sample specialties data
const specialtiesData = [
  {
    name: 'Cardiology',
    description: 'Heart and cardiovascular system specialists',
    icon: '❤️',
    isActive: true,
  },
  {
    name: 'Dermatology',
    description: 'Skin, hair, and nail care specialists',
    icon: '🧴',
    isActive: true,
  },
  {
    name: 'Neurology',
    description: 'Brain and nervous system specialists',
    icon: '🧠',
    isActive: true,
  },
  {
    name: 'Orthopedics',
    description: 'Bone, joint, and muscle specialists',
    icon: '🦴',
    isActive: true,
  },
  {
    name: 'Pediatrics',
    description: 'Children and adolescent health specialists',
    icon: '👶',
    isActive: true,
  },
  {
    name: 'Dentistry',
    description: 'Oral health and dental care specialists',
    icon: '🦷',
    isActive: true,
  },
  {
    name: 'Ophthalmology',
    description: 'Eye care and vision specialists',
    icon: '👁️',
    isActive: true,
  },
  {
    name: 'Psychiatry',
    description: 'Mental health and behavioral specialists',
    icon: '🧘',
    isActive: true,
  },
  {
    name: 'General Medicine',
    description: 'Primary care and general health specialists',
    icon: '🩺',
    isActive: true,
  },
  {
    name: 'Surgery',
    description: 'Surgical procedure specialists',
    icon: '⚕️',
    isActive: true,
  },
];

async function seedSpecialties() {
  try {
    // Connect to MongoDB
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Clear existing specialties (optional - comment out if you want to keep existing data)
    // await Specialty.deleteMany({});
    // console.log('🗑️  Cleared existing specialties');

    // Insert specialties
    let created = 0;
    let skipped = 0;

    for (const specialtyData of specialtiesData) {
      const existing = await Specialty.findOne({ name: specialtyData.name });
      
      if (existing) {
        console.log(`⏭️  Skipped: ${specialtyData.name} (already exists)`);
        skipped++;
      } else {
        await Specialty.create(specialtyData);
        console.log(`✅ Created: ${specialtyData.name}`);
        created++;
      }
    }

    console.log('\n=== Summary ===');
    console.log(`✅ Created: ${created} specialties`);
    console.log(`⏭️  Skipped: ${skipped} specialties`);
    console.log('===============\n');

    // Get all specialties with IDs
    const allSpecialties = await Specialty.find({});
    console.log('\n=== All Specialty IDs (for doctor creation) ===');
    allSpecialties.forEach(spec => {
      console.log(`${spec.name}: ${spec._id}`);
    });
    console.log('=======================================\n');

    // Disconnect
    await mongoose.disconnect();
    console.log('✅ Disconnected from MongoDB');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding specialties:', error);
    process.exit(1);
  }
}

seedSpecialties();

