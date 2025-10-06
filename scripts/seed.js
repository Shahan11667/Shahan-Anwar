const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env.local') });

// Connect to MongoDB
const connectDB = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI;
    if (!mongoUri) {
      throw new Error('MONGODB_URI environment variable is not set');
    }
    await mongoose.connect(mongoUri);
    console.log('MongoDB connected successfully');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

// Project Schema
const ProjectSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  techStack: [{ type: String, required: true }],
  githubLink: { type: String, required: true },
  demoLink: { type: String, required: true },
  image: { type: String, required: true },
}, { timestamps: true });

// User Schema
const UserSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  passwordHash: { type: String, required: true },
}, { timestamps: true });

const Project = mongoose.models.Project || mongoose.model('Project', ProjectSchema);
const User = mongoose.models.User || mongoose.model('User', UserSchema);

// Sample projects data
const sampleProjects = [
  {
    title: "E-Commerce Platform",
    description: "A full-stack e-commerce platform built with Next.js, featuring user authentication, payment processing, and admin dashboard. Includes real-time inventory management and order tracking.",
    techStack: ["Next.js", "TypeScript", "MongoDB", "Stripe", "Tailwind CSS"],
    githubLink: "https://github.com/johndoe/ecommerce-platform",
    demoLink: "https://ecommerce-demo.vercel.app",
    image: "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=800&h=600&fit=crop"
  },
  {
    title: "Task Management App",
    description: "A collaborative task management application with real-time updates, drag-and-drop functionality, and team collaboration features. Built with modern web technologies.",
    techStack: ["React", "Node.js", "Socket.io", "PostgreSQL", "Material-UI"],
    githubLink: "https://github.com/johndoe/task-manager",
    demoLink: "https://taskmanager-demo.vercel.app",
    image: "https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=800&h=600&fit=crop"
  },
  {
    title: "Weather Dashboard",
    description: "A responsive weather dashboard that displays current weather conditions and forecasts for multiple cities. Features interactive maps and detailed weather analytics.",
    techStack: ["Vue.js", "Express", "OpenWeather API", "Chart.js", "CSS3"],
    githubLink: "https://github.com/johndoe/weather-dashboard",
    demoLink: "https://weather-demo.vercel.app",
    image: "https://images.unsplash.com/photo-1504608524841-42fe6f032b4b?w=800&h=600&fit=crop"
  },
  {
    title: "Social Media Analytics",
    description: "A comprehensive analytics platform for social media metrics tracking. Provides insights into engagement, reach, and performance across multiple platforms.",
    techStack: ["Angular", "Python", "Django", "Redis", "D3.js"],
    githubLink: "https://github.com/johndoe/social-analytics",
    demoLink: "https://social-analytics-demo.vercel.app",
    image: "https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=800&h=600&fit=crop"
  },
  {
    title: "Real Estate Portal",
    description: "A modern real estate platform with property listings, virtual tours, and mortgage calculators. Features advanced search filters and interactive property maps.",
    techStack: ["Next.js", "Prisma", "MySQL", "Mapbox", "Framer Motion"],
    githubLink: "https://github.com/johndoe/real-estate-portal",
    demoLink: "https://realestate-demo.vercel.app",
    image: "https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=800&h=600&fit=crop"
  },
  {
    title: "Learning Management System",
    description: "An educational platform with course management, video streaming, quizzes, and progress tracking. Supports multiple user roles and interactive learning features.",
    techStack: ["React", "Node.js", "MongoDB", "AWS S3", "WebRTC"],
    githubLink: "https://github.com/johndoe/lms-platform",
    demoLink: "https://lms-demo.vercel.app",
    image: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800&h=600&fit=crop"
  }
];

// Seed function
const seedDatabase = async () => {
  try {
    await connectDB();

    // Clear existing data
    await Project.deleteMany({});
    await User.deleteMany({});
    console.log('Cleared existing data');

    // Create admin user
    const hashedPassword = await bcrypt.hash(process.env.ADMIN_PASSWORD || 'admin123', 10);
    const adminUser = new User({
      username: process.env.ADMIN_USERNAME || 'admin',
      passwordHash: hashedPassword
    });
    await adminUser.save();
    console.log('Admin user created');

    // Create sample projects
    const projects = await Project.insertMany(sampleProjects);
    console.log(`Created ${projects.length} sample projects`);

    console.log('Database seeded successfully!');
    console.log('\nAdmin credentials:');
    console.log(`Username: ${process.env.ADMIN_USERNAME || 'admin'}`);
    console.log(`Password: ${process.env.ADMIN_PASSWORD || 'admin123'}`);
    console.log('\nYou can now start the development server with: npm run dev');

  } catch (error) {
    console.error('Error seeding database:', error);
  } finally {
    mongoose.connection.close();
  }
};

// Run seed function
seedDatabase();
