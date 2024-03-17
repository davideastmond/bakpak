import { Message } from '@/models/messaging/message.model';
import { Schema } from 'mongoose';

export const messageSchema = new Schema<Message>({
  parentThreadId: { type: String, required: true }, // id of the thread this message is part of
  sender: { type: String, required: true }, // user id of the person who sent the message
  body: { type: String, required: true },
  timestamp: { type: Date, required: true, default: Date.now() },
  recipients: { type: [String], required: true }, // user ids of people who received the message
});
