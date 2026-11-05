import mongoose, { Schema, Model } from 'mongoose';

export interface IDailyPack {
  _id?: string;
  dateKey: string; // YYYY-MM-DD
  genre: string;
  focus?: string; // Beshaan topic of the pack (Life lessons, Fashion, Lifestyle, Gaming)
  theme?: string; // the situation the story is built on (used to avoid repeats)
  title: string;
  idea: string;
  story: string;
  characters: { name: string; description: string }[];
  scenes: { prompt: string; narration: string; caption: string; duration: number }[];
  thumbnail: { headline: string; badge: string; imagePrompt: string };
  // one set for every platform. Packs made before this change keep one set per platform (youtube, tiktok, ...).
  seo: { title: string; description: string; hashtags: string };
  status: 'new' | 'used';
  source: 'cron' | 'manual';
  createdAt?: Date;
}

const DailyPackSchema = new Schema(
  {
    dateKey: { type: String, required: true, index: true },
    genre: String,
    focus: String,
    theme: String,
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
