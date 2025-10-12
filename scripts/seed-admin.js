const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
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

// Admin Schema
const AdminSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    role: {
      type: String,
      default: 'admin',
      enum: ['admin', 'superadmin'],
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

const Admin = mongoose.models.Admin || mongoose.model('Admin', AdminSchema);

async function seedAdmin() {
  try {
    // Connect to MongoDB
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Check if admin already exists
    const existingAdmin = await Admin.findOne({ email: 'admin@example.com' });
    
    if (existingAdmin) {
      console.log('⚠️  Admin user already exists');
      console.log('Email:', existingAdmin.email);
      console.log('Name:', existingAdmin.name);
      
      // Ask if you want to update the password
      const newPassword = 'admin123';
      const hashedPassword = await bcrypt.hash(newPassword, 10);
      
      existingAdmin.password = hashedPassword;
      await existingAdmin.save();
      
      console.log('✅ Admin password updated to: admin123');
    } else {
      // Create new admin user
      const password = 'admin123';
      const hashedPassword = await bcrypt.hash(password, 10);

      const admin = new Admin({
        email: 'admin@example.com',
        password: hashedPassword,
        name: 'Admin User',
        role: 'admin',
        isActive: true,
      });

      await admin.save();
      console.log('✅ Admin user created successfully!');
    }

    console.log('\n=== Admin Credentials ===');
    console.log('Email: admin@example.com');
    console.log('Password: admin123');
    console.log('========================\n');

    // Disconnect
    await mongoose.disconnect();
    console.log('✅ Disconnected from MongoDB');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding admin:', error);
    process.exit(1);
  }
}

seedAdmin();

