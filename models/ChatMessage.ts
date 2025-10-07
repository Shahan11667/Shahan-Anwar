import mongoose, { Document, Schema } from 'mongoose'

export interface IChatMessage extends Document {
  sender: mongoose.Types.ObjectId
  recipient?: mongoose.Types.ObjectId // For private messages
  content: string
  messageType: 'text' | 'image' | 'video' | 'document' | 'file'
  fileUrl?: string // URL for media files
  fileName?: string // Original file name
  fileSize?: number // File size in bytes
  mimeType?: string // MIME type of the file
  roomId?: string // For group messages
  conversationType: 'private' | 'group' // Type of conversation
  isEdited: boolean
  editedAt?: Date
  isDeleted: boolean
  deletedAt?: Date
  replyTo?: mongoose.Types.ObjectId
  reactions: Array<{
    user: mongoose.Types.ObjectId
    emoji: string
    createdAt: Date
  }>
  readBy: mongoose.Types.ObjectId[]
  createdAt: Date
  updatedAt: Date
}

const ChatMessageSchema = new Schema<IChatMessage>({
  sender: {
    type: Schema.Types.ObjectId,
    ref: 'ChatUser',
    required: true
  },
  recipient: {
    type: Schema.Types.ObjectId,
    ref: 'ChatUser'
  },
  content: {
    type: String,
    required: true,
    maxlength: 1000
  },
  messageType: {
    type: String,
    enum: ['text', 'image', 'video', 'document', 'file'],
    default: 'text'
  },
  fileUrl: {
    type: String
  },
  fileName: {
    type: String
  },
  fileSize: {
    type: Number
  },
  mimeType: {
    type: String
  },
  roomId: {
    type: String,
    default: 'general'
  },
  conversationType: {
    type: String,
    enum: ['private', 'group'],
    default: 'group'
  },
  isEdited: {
    type: Boolean,
    default: false
  },
  editedAt: {
    type: Date
  },
  isDeleted: {
    type: Boolean,
    default: false
  },
  deletedAt: {
    type: Date
  },
  replyTo: {
    type: Schema.Types.ObjectId,
    ref: 'ChatMessage'
  },
  reactions: [{
    user: {
      type: Schema.Types.ObjectId,
      ref: 'ChatUser',
      required: true
    },
    emoji: {
      type: String,
      required: true
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  readBy: [{
    type: Schema.Types.ObjectId,
    ref: 'ChatUser'
  }]
}, {
  timestamps: true
})

// Index for better performance
ChatMessageSchema.index({ sender: 1, createdAt: -1 })
ChatMessageSchema.index({ roomId: 1, createdAt: -1 })
ChatMessageSchema.index({ isDeleted: 1 })

export default mongoose.models.ChatMessage || mongoose.model<IChatMessage>('ChatMessage', ChatMessageSchema)
