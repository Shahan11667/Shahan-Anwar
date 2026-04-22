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

export interface IAbout extends Document {
  title: string;
  subtitle: string;
  bioParagraphs: string[];
  skills: ISkill[];
  experience: IExperience[];
  education: IEducation[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const SkillSchema = new Schema<ISkill>({
  name: { type: String, required: true },
  icon: { type: String, required: true }, // Store icon name as string (e.g., 'Code', 'Server')
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
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
    },
    subtitle: {
      type: String,
      required: [true, 'Subtitle is required'],
      trim: true,
    },
    bioParagraphs: [
      {
        type: String,
        required: true,
      },
    ],
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
