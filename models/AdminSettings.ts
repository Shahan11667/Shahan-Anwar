import mongoose, { Document, Schema, Model } from 'mongoose';

export interface IAdminSettings extends Document {
  videoEditorEnabled: boolean;
  videoTrimEnabled: boolean;
  videoResizeEnabled: boolean;
  // Tools Toggles
  pdfEditorEnabled: boolean;
  wordToPdfEnabled: boolean;
  pdfToWordEnabled: boolean;
  wordEditorEnabled: boolean;
  imageEditorEnabled: boolean;
  screenshotStudioEnabled: boolean;
  resumeBuilderEnabled: boolean;
  invoiceGeneratorEnabled: boolean;
  nicheCalculatorsEnabled: boolean;
  dataConverterEnabled: boolean;
  focusTimerEnabled: boolean;
  musicStudioEnabled: boolean;
  interiorPlannerEnabled: boolean;
  // Complete PDF Suite Toggles
  pdfSuiteEnabled: boolean;
  organizePdfEnabled: boolean;
  compressPdfEnabled: boolean;
  convertToPdfEnabled: boolean;
  convertFromPdfEnabled: boolean;
  pdfAnnotateEnabled: boolean;
  pdfSecurityEnabled: boolean;
  pdfIntelligenceEnabled: boolean;
  // Specialist PDF Features Toggles
  pdfTextReflowEnabled: boolean;
  pdfBulkHighlightsEnabled: boolean;
  pdfAdvancedTypographyEnabled: boolean;
  pdfMultiObjectAlignmentEnabled: boolean;
  pdfReferenceManagerEnabled: boolean;
  pdfMindMapEnabled: boolean;
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
    },
    // Tools
    pdfEditorEnabled: {
      type: Boolean,
      default: true,
      required: true
    },
    wordToPdfEnabled: {
      type: Boolean,
      default: true,
      required: true
    },
    pdfToWordEnabled: {
      type: Boolean,
      default: true,
      required: true
    },
    wordEditorEnabled: {
      type: Boolean,
      default: true,
      required: true
    },
    imageEditorEnabled: {
      type: Boolean,
      default: true,
      required: true
    },
    screenshotStudioEnabled: {
      type: Boolean,
      default: true,
      required: true
    },
    resumeBuilderEnabled: {
      type: Boolean,
      default: true,
      required: true
    },
    invoiceGeneratorEnabled: {
      type: Boolean,
      default: true,
      required: true
    },
    nicheCalculatorsEnabled: {
      type: Boolean,
      default: true,
      required: true
    },
    dataConverterEnabled: {
      type: Boolean,
      default: true,
      required: true
    },
    focusTimerEnabled: {
      type: Boolean,
      default: true,
      required: true
    },
    musicStudioEnabled: {
      type: Boolean,
      default: true,
      required: true
    },
    interiorPlannerEnabled: {
      type: Boolean,
      default: true,
      required: true
    },
    // Complete PDF Suite Toggles
    pdfSuiteEnabled: {
      type: Boolean,
      default: true,
      required: true
    },
    organizePdfEnabled: {
      type: Boolean,
      default: true,
      required: true
    },
    compressPdfEnabled: {
      type: Boolean,
      default: true,
      required: true
    },
    convertToPdfEnabled: {
      type: Boolean,
      default: true,
      required: true
    },
    convertFromPdfEnabled: {
      type: Boolean,
      default: true,
      required: true
    },
    pdfAnnotateEnabled: {
      type: Boolean,
      default: true,
      required: true
    },
    pdfSecurityEnabled: {
      type: Boolean,
      default: true,
      required: true
    },
    pdfIntelligenceEnabled: {
      type: Boolean,
      default: true,
      required: true
    },
    // Specialist PDF Features
    pdfTextReflowEnabled: {
      type: Boolean,
      default: true,
      required: true
    },
    pdfBulkHighlightsEnabled: {
      type: Boolean,
      default: true,
      required: true
    },
    pdfAdvancedTypographyEnabled: {
      type: Boolean,
      default: true,
      required: true
    },
    pdfMultiObjectAlignmentEnabled: {
      type: Boolean,
      default: true,
      required: true
    },
    pdfReferenceManagerEnabled: {
      type: Boolean,
      default: true,
      required: true
    },
    pdfMindMapEnabled: {
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
