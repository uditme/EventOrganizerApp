import mongoose from 'mongoose';

export interface IEvent extends mongoose.Document {
  name: string;
  description: string;
  date: Date;
  location: string;
  organizerId: mongoose.Types.ObjectId;
  eventCode: string;
  attendees: {
    userId: mongoose.Types.ObjectId;
    joinedAt: Date;
  }[];
  circulars: {
    type: 'text' | 'voice';
    content?: string;
    audioUrl?: string;
    sentAt: Date;
    sentBy: string;
  }[];
  createdAt: Date;
  updatedAt: Date;
}

const EventSchema = new mongoose.Schema<IEvent>(
  {
    name: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    date: {
      type: Date,
      required: true,
    },
    location: {
      type: String,
      required: true,
    },
    organizerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    eventCode: {
      type: String,
      required: true,
      unique: true,
    },
    attendees: [{
      userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
      },
      joinedAt: {
        type: Date,
        default: Date.now,
      },
    }],
    circulars: [{
      type: {
        type: String,
        enum: ['text', 'voice'],
        required: true,
      },
      content: {
        type: String,
        required: false,
      },
      audioUrl: {
        type: String,
        required: false,
      },
      sentAt: {
        type: Date,
        default: Date.now,
      },
      sentBy: {
        type: String,
        required: true,
      },
    }],
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.Event || mongoose.model<IEvent>('Event', EventSchema);
