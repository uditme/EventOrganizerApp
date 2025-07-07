import mongoose from 'mongoose';

export interface IComplaint extends mongoose.Document {
  eventId: mongoose.Types.ObjectId;
  organizerId: mongoose.Types.ObjectId;
  message: string;
  status: 'pending' | 'reviewed' | 'resolved';
  createdAt: Date;
  updatedAt: Date;
}

const ComplaintSchema = new mongoose.Schema<IComplaint>(
  {
    eventId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Event',
      required: true,
    },
    organizerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ['pending', 'reviewed', 'resolved'],
      default: 'pending',
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.Complaint || mongoose.model<IComplaint>('Complaint', ComplaintSchema);
