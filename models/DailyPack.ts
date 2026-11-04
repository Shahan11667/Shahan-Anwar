import mongoose, { Schema, Model } from 'mongoose';

export interface IDailyPack {
  _id?: string;
  dateKey: string; // YYYY-MM-DD
  genre: string;
  title: string;
  idea: string;
  story: string;
  characters: { name: string; description: string }[];
  scenes: { prompt: string; narration: string; caption: string; duration: number }[];
  thumbnail: { headline: string; badge: string; imagePrompt: string };
  seo: Record<'youtube' | 'tiktok' | 'instagram' | 'facebook', { title: string; description: string; hashtags: string; tags: string }>;
  status: 'new' | 'used';
  source: 'cron' | 'manual';
  createdAt?: Date;
}

const DailyPackSchema = new Schema(
  {
    dateKey: { type: String, required: true, index: true },
    genre: String,
    title: String,
    idea: String,
    story: String,
    characters: [{ name: String, description: String }],
    scenes: [{ prompt: String, narration: String, caption: String, duration: Number }],
    thumbnail: { headline: String, badge: String, imagePrompt: String },
    seo: { type: Schema.Types.Mixed, default: {} },
    status: { type: String, enum: ['new', 'used'], default: 'new' },
    source: { type: String, enum: ['cron', 'manual'], default: 'cron' },
  },
  { timestamps: true }
);

const DailyPack: Model<IDailyPack> = mongoose.models.DailyPack || mongoose.model<IDailyPack>('DailyPack', DailyPackSchema);
export default DailyPack;
