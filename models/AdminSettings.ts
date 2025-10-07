import mongoose, { Document, Schema, Model } from 'mongoose';

export interface IAdminSettings extends Document {
  videoEditorEnabled: boolean;
  videoTrimEnabled: boolean;
  videoResizeEnabled: boolean;
  // Add more feature flags as needed
  createdAt: Date;
  updatedAt: Date;
}

const AdminSettingsSchema = new Schema<IAdminSettings>(
  {
    videoEditorEnabled: {
      type: Boolean,
      default: true,
      required: true
    },
    videoTrimEnabled: {
      type: Boolean,
      default: true,
      required: true
    },
    videoResizeEnabled: {
      type: Boolean,
      default: true,
      required: true
    }
  },
  {
    timestamps: true,
    collection: 'admin_settings'
  }
);

// Ensure only one settings document exists
AdminSettingsSchema.index({}, { unique: true });

const AdminSettings: Model<IAdminSettings> =
  mongoose.models.AdminSettings || mongoose.model<IAdminSettings>('AdminSettings', AdminSettingsSchema);

export default AdminSettings;

