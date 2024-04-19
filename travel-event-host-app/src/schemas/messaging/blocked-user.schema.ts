import { BlockedUser } from '@/models/messaging/blocked-user.model';
import { Schema } from 'mongoose';

export const blockedUserSchema = new Schema<BlockedUser>({
  userId: { type: String, required: true },
  timestamp: { type: Date, required: true, default: Date.now() },
});
