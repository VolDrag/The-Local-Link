import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema(
  {
    booking: { type: mongoose.Schema.Types.ObjectId, ref: 'Booking', required: true, index: true },
    sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    body: { type: String, required: true, maxlength: 2000, trim: true },
    readAt: { type: Date, default: null },
  },
  { timestamps: true }
);

messageSchema.index({ booking: 1, createdAt: 1 });

const Message = mongoose.model('Message', messageSchema);
export default Message;
