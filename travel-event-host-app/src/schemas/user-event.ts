import { UserEvent } from '@/models/user-event';
import mongoose, { Schema } from 'mongoose';
import { EventParticipantSchema } from './event-participant';

const userEventSchema = new Schema<UserEvent>(
  {
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: false,
    },
    imageUrl: String,
    eventCreatorId: String,

    participants: [EventParticipantSchema],

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
    startDate: Date,
    endDate: Date,
    categories: [String],
  },

  { timestamps: true },
);

export const EventRepository: mongoose.Model<UserEvent> =
  mongoose.models.UserEvent || mongoose.model<UserEvent>('UserEvent', userEventSchema);
