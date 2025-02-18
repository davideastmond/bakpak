import { User } from '@/models/user';
import mongoose, { Schema } from 'mongoose';
import { blockedUserSchema } from './messaging/blocked-user.schema';

const userSchema = new Schema<User>(
  {
    firstName: {
      type: String,
      required: true,
    },
    imageUrl: String,
    bio: {
      type: String,
      maxlength: 255,
    },
    lastName: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
    password: {
      type: String,
      required: true,
    },
    location: {
      country: String,
      state: String,
      city: String,
      formattedAddress: String,
      timezone: {
        id: String,
        name: String,
      },
      coords: { lat: mongoose.Types.Decimal128, lng: mongoose.Types.Decimal128 },
      place_id: String,
    },

    isAdmin: {
      type: Boolean,
      default: false,
    },

    blockedUsers: [blockedUserSchema],
  },
  { timestamps: true },
);

export const UserRepository: mongoose.Model<User> =
  mongoose.models.User || mongoose.model<User>('User', userSchema);
