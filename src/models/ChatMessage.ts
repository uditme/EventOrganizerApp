import mongoose from 'mongoose';

export interface IChatMessage extends mongoose.Document {
  eventId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  senderName: string;
  content: string;
  type: 'text' | 'announcement' | 'image' | 'file';
  fileUrl?: string;
  fileName?: string;
  fileSize?: number;
  mimeType?: string;
  sentAt: Date;
}

const ChatMessageSchema = new mongoose.Schema<IChatMessage>({
  eventId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Event',
    required: true,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  senderName: {
    type: String,
    required: true,
  },
  content: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    enum: ['text', 'announcement', 'image', 'file'],
    default: 'text',
  },
  fileUrl: {
    type: String,
    required: false,
  },
  fileName: {
    type: String,
    required: false,
  },
  fileSize: {
    type: Number,
    required: false,
  },
  mimeType: {
    type: String,
    required: false,
  },
  sentAt: {
    type: Date,
    default: Date.now,
  },
}, {
  timestamps: true,
});

export default mongoose.models.ChatMessage || mongoose.model<IChatMessage>('ChatMessage', ChatMessageSchema);
