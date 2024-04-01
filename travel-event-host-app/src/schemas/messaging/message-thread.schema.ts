import { MessageThread } from '@/models/messaging/message-thread.model';
import mongoose, { Schema } from 'mongoose';
import { messageSchema } from './message.schema';

const messageThreadSchema = new Schema<MessageThread>({
  originator: {
    type: String,
    required: true,
  },
  recipients: {
    type: [String],
    required: true,
  },
  createdDate: {
    type: Date,
    required: true,
  },
  updatedDate: {
    type: Date,
    required: true,
  },
  messages: { type: [messageSchema], default: [] },
});

export const MessageThreadRepository: mongoose.Model<MessageThread> =
  mongoose.models.MessageThread ||
  mongoose.model<MessageThread>('MessageThread', messageThreadSchema);
