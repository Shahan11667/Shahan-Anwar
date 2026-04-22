const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables from .env.local
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error('Please define the MONGODB_URI environment variable inside .env.local');
  process.exit(1);
}

// Define Schema (we can't easily import the TS model in a plain JS script without ts-node)
const SkillSchema = new mongoose.Schema({
  name: { type: String, required: true },
  icon: { type: String, required: true },
  technologies: [{ type: String }],
});

const ExperienceSchema = new mongoose.Schema({
  year: { type: String, required: true },
  title: { type: String, required: true },
  company: { type: String, required: true },
  description: { type: String, required: true },
});

const EducationSchema = new mongoose.Schema({
  degree: { type: String, required: true },
  school: { type: String, required: true },
  year: { type: String, required: true },
});

const AboutSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    subtitle: { type: String, required: true },
    bioParagraphs: [{ type: String, required: true }],
    skills: [SkillSchema],
    experience: [ExperienceSchema],
    education: [EducationSchema],
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

const About = mongoose.models.About || mongoose.model('About', AboutSchema);

async function seedAbout() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('Connected successfully.');

    // Deactivate existing records
    await About.updateMany({}, { isActive: false });

    const aboutData = {
      title: "About Shahan Anwar - Full Stack Developer & AI Specialist",
      subtitle: "I'm Shahan Anwar, a passionate Full Stack Developer and AI specialist with extensive experience building large-scale digital platforms for government, event management, and e-commerce. I specialize in modern JavaScript frameworks and scalable backend architectures.",
      bioParagraphs: [
        "I'm Shahan Anwar, a creative problem-solver who loves turning complex ideas into simple, beautiful, and intuitive solutions. As a Senior Software Engineer, I have a strong foundation in both frontend and backend development, specializing in React, Next.js, Node.js, and mobile app development.",
        "With a background spanning government digital services, global event management platforms, and nationwide logistics systems, I bring a wealth of experience in building secure, scalable, and high-performance applications.",
        "I am a Gold Medalist in Computer Science and currently pursuing a Master's in Artificial Intelligence, constantly seeking to integrate cutting-edge AI technologies into practical, real-world solutions."
      ],
      skills: [
        { name: 'Frontend', icon: 'Code', technologies: ['React', 'Next.js', 'TypeScript', 'Tailwind CSS', 'Nuxt.js', 'Redux'] },
        { name: 'Backend', icon: 'Server', technologies: ['Node.js', 'Express', 'Laravel', 'PHP', 'Python', 'REST APIs'] },
        { name: 'Mobile', icon: 'Smartphone', technologies: ['React Native', 'Firebase', 'Push Notifications', 'Offline Sync'] },
        { name: 'Real-time', icon: 'Globe', technologies: ['Socket.IO', 'Real-time Analytics', 'GPS Tracking'] },
        { name: 'Database', icon: 'Database', technologies: ['MongoDB', 'PostgreSQL', 'MySQL', 'Redis'] },
        { name: 'AI & Tools', icon: 'Palette', technologies: ['Artificial Intelligence', 'Figma', 'AWS', 'Docker', 'CI/CD'] },
      ],
      experience: [
        {
          year: '2026 – Present',
          title: 'Senior Software Engineer',
          company: 'Punjab Information Technology Board (PITB) | Lahore, Pakistan',
          description: 'Leading development of multiple government platforms, including a unified public services portal and a real-time grievance redressal system. Engineering large-scale data systems with role-based access control and government-standard security compliance.',
        },
        {
          year: '2025 – Present',
          title: 'Sr. Software Engineer',
          company: 'EventBuizz | Lahore, Pakistan',
          description: 'Engineered a scalable multi-tenant backend platform for a global event management system. Migrated legacy systems to Next.js/TypeScript and rebuilt cross-platform mobile apps in React Native with Firebase integration.',
        },
        {
          year: '2022 – 2024',
          title: 'Sr. Software Engineer',
          company: 'Skynet Solutions | Johar Town, Lahore',
          description: 'Built scalable fleet booking and distribution management systems using Laravel and React Native. Created full-stack Hajj/Umrah travel booking platforms handling high-volume daily transactions and real-time tracking.',
        },
        {
          year: '2021 – 2022',
          title: 'Software Engineer',
          company: 'Meptics | Amanah Mall, Lahore',
          description: 'Led development of a lucky draw platform concept to production. Designed secure Laravel backends and responsive React.js frontends featuring quizzes, leaderboards, and automated reward distribution.',
        }
      ],
      education: [
        {
          degree: 'Master of Science in Artificial Intelligence',
          school: 'Superior University Lahore | Lahore, Pakistan',
          year: 'Present',
        },
        {
          degree: 'Bachelor of Science in Computer Science — Gold Medalist',
          school: 'University of South Asia, Lahore | Lahore, Pakistan',
          year: 'Completed',
        },
      ],
      isActive: true,
    };

    const newAbout = new About(aboutData);
    await newAbout.save();

    console.log('About section seeded successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding About section:', error);
    process.exit(1);
  }
}

seedAbout();
