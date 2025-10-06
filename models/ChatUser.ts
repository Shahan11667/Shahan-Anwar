import mongoose, { Document, Schema } from 'mongoose'

export interface IChatUser extends Document {
  username: string
  email: string
  password: string
  displayName: string
  avatar?: string
  isApproved: boolean
  isOnline: boolean
  lastSeen: Date
  role: 'user' | 'admin'
  createdAt: Date
  updatedAt: Date
}

const ChatUserSchema = new Schema<IChatUser>({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    minlength: 3,
    maxlength: 20
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  displayName: {
    type: String,
    required: true,
    trim: true,
    maxlength: 50
  },
  avatar: {
    type: String,
    default: ''
  },
  isApproved: {
    type: Boolean,
    default: false
  },
  isOnline: {
    type: Boolean,
    default: false
  },
  lastSeen: {
    type: Date,
    default: Date.now
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user'
  }
}, {
  timestamps: true
})

// Index for better performance (username and email already have unique indexes)
ChatUserSchema.index({ isApproved: 1 })
ChatUserSchema.index({ isOnline: 1 })

export default mongoose.models.ChatUser || mongoose.model<IChatUser>('ChatUser', ChatUserSchema)
