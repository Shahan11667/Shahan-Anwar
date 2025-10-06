import mongoose, { Document, Schema } from 'mongoose';

export interface IProject extends Document {
  title: string;
  description: string;
  longDescription?: string;
  techStack: string[];
  githubLink: string;
  demoLink: string;
  image: string;
  images?: string[];
  createdAt: Date;
  updatedAt: Date;
}

const ProjectSchema = new Schema<IProject>({
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true,
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
    trim: true,
  },
  techStack: [{
    type: String,
    required: true,
  }],
  githubLink: {
    type: String,
    required: [true, 'GitHub link is required'],
    trim: true,
  },
  demoLink: {
    type: String,
    required: [true, 'Demo link is required'],
    trim: true,
  },
  image: {
    type: String,
    required: [true, 'Image is required'],
    trim: true,
  },
  images: [{
    type: String,
    trim: true,
  }],
  longDescription: {
    type: String,
    trim: true,
  },
}, {
  timestamps: true,
});

export default mongoose.models.Project || mongoose.model<IProject>('Project', ProjectSchema);
