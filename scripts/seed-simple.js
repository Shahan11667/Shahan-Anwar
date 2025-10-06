const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// MongoDB connection string - replace with your actual connection string
const MONGODB_URI = "mongodb+srv://shahananwar39:5BiDvyWAHpKE1Rzz@shahan.ddlnagz.mongodb.net/myDatabase?retryWrites=true&w=majority&appName=Shahan";

// Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(MONGODB_URI);
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

// Hero Schema
const HeroSchema = new mongoose.Schema({
  name: { type: String, required: true },
  title: { type: String, required: true },
  subtitle: { type: String, required: true },
  description: { type: String, required: true },
  image: { type: String, required: true },
  resumeLink: { type: String, required: true },
  socialLinks: {
    github: { type: String, required: true },
    linkedin: { type: String, required: true },
    email: { type: String, required: true },
  },
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

// Contact Info Schema
const ContactInfoSchema = new mongoose.Schema({
  email: { type: String, required: true },
  phone: { type: String, required: true },
  location: { type: String, required: true },
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

const Project = mongoose.models.Project || mongoose.model('Project', ProjectSchema);
const User = mongoose.models.User || mongoose.model('User', UserSchema);
const Hero = mongoose.models.Hero || mongoose.model('Hero', HeroSchema);
const ContactInfo = mongoose.models.ContactInfo || mongoose.model('ContactInfo', ContactInfoSchema);

// Sample projects data
const sampleProjects = [
  {
    title: "E-Commerce Platform",
    description: "A full-stack e-commerce platform built with Next.js, featuring user authentication, payment processing, and admin dashboard. Includes real-time inventory management and order tracking.",
        longDescription: "This comprehensive e-commerce platform was built from the ground up using modern web technologies. The application features a robust user authentication system with JWT tokens, a complete product management system with image uploads, a sophisticated shopping cart with real-time updates, and secure payment processing through Stripe integration.\n\nThe platform includes an admin dashboard for managing products, orders, and users, as well as a responsive frontend that works seamlessly across all devices. The backend API is built with Next.js API routes and uses MongoDB for data persistence.\n\nKey features include:\n- User registration and authentication\n- Product catalog with search and filtering\n- Shopping cart with persistent storage\n- Order management system\n- Payment processing with Stripe\n- Admin dashboard for content management\n- Responsive design for all devices",
    techStack: ["Next.js", "TypeScript", "MongoDB", "Stripe", "Tailwind CSS"],
    githubLink: "https://github.com/johndoe/ecommerce-platform",
    demoLink: "https://ecommerce-demo.vercel.app",
        image: "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=800&h=600&fit=crop",
        images: [
            "https://images.unsplash.com/photo-1556742111-a301076d9d18?w=800&h=600&fit=crop",
            "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=800&h=600&fit=crop",
            "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=800&h=600&fit=crop"
        ]
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
    const hashedPassword = await bcrypt.hash('admin123', 10);
    const adminUser = new User({
      username: 'admin',
      passwordHash: hashedPassword
    });
    await adminUser.save();
    console.log('Admin user created');

    // Create sample projects
    const projects = await Project.insertMany(sampleProjects);
    console.log(`Created ${projects.length} sample projects`);

    // Create hero data
    const heroData = {
      name: "Shahan Anwar",
      title: "Full Stack Developer & UI/UX Enthusiast",
      subtitle: "Passionate about creating digital experiences",
      description: "I create beautiful, functional, and user-centered digital experiences that make a difference. With expertise in modern web technologies and a keen eye for design, I bring ideas to life through code.",
      image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=500&h=500&fit=crop&crop=face",
      resumeLink: "https://example.com/resume.pdf",
      socialLinks: {
        github: "https://github.com/shahananwar39",
        linkedin: "https://linkedin.com/in/shahananwar39",
        email: "mailto:shahananwar39@gmail.com"
      },
      isActive: true
    };

    // Clear existing hero data
    await Hero.deleteMany({});
    
    // Create hero record
    const hero = new Hero(heroData);
    await hero.save();
    console.log('Hero data created');

    // Create contact info data
    const contactInfoData = {
      email: "shahananwar39@gmail.com",
      phone: "+1 (555) 123-4567",
      location: "San Francisco, CA",
      isActive: true
    };

    // Clear existing contact info data
    await ContactInfo.deleteMany({});
    
    // Create contact info record
    const contactInfo = new ContactInfo(contactInfoData);
    await contactInfo.save();
    console.log('Contact info data created');

    console.log('Database seeded successfully!');
    console.log('\nAdmin credentials:');
    console.log('Username: admin');
    console.log('Password: admin123');
    console.log('\nYou can now start the development server with: npm run dev');

  } catch (error) {
    console.error('Error seeding database:', error);
  } finally {
    mongoose.connection.close();
  }
};

// Run seed function
seedDatabase();
