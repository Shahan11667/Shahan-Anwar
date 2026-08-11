import mongoose, { Document, Schema } from 'mongoose';

export interface ISkill {
  name: string;
  icon: string;
  technologies: string[];
}

export interface IExperience {
  year: string;
  title: string;
  company: string;
  description: string;
}

export interface IEducation {
  degree: string;
  school: string;
  year: string;
}

export interface IStat {
  value: string;
  label: string;
}

export interface IAbout extends Document {
  badge?: string;
  title: string;
  accentTitle?: string;
  subtitle: string;
  image?: string;
  bioParagraphs: string[];
  stats?: IStat[];
  skills: ISkill[];
  experience: IExperience[];
  education: IEducation[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const StatSchema = new Schema<IStat>({
  value: { type: String, required: true },
  label: { type: String, required: true },
});

const SkillSchema = new Schema<ISkill>({
  name: { type: String, required: true },
  icon: { type: String, required: true }, // Store icon name as string
  technologies: [{ type: String }],
});

const ExperienceSchema = new Schema<IExperience>({
  year: { type: String, required: true },
  title: { type: String, required: true },
  company: { type: String, required: true },
  description: { type: String, required: true },
});

const EducationSchema = new Schema<IEducation>({
  degree: { type: String, required: true },
  school: { type: String, required: true },
  year: { type: String, required: true },
});

const AboutSchema = new Schema<IAbout>(
  {
    badge: {
      type: String,
      default: 'ABOUT ME',
      trim: true,
    },
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
    },
    accentTitle: {
      type: String,
      default: 'Summary',
      trim: true,
    },
    subtitle: {
      type: String,
      default: 'A dedicated healthcare provider committed to clinical excellence and empathetic patient care.',
      trim: true,
    },
    image: {
      type: String,
      default: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=600&h=700&fit=crop',
      trim: true,
    },
    bioParagraphs: [
      {
        type: String,
        required: true,
      },
    ],
    stats: [StatSchema],
    skills: [SkillSchema],
    experience: [ExperienceSchema],
    education: [EducationSchema],
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.About || mongoose.model<IAbout>('About', AboutSchema);

