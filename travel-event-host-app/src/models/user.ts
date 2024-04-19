import { LocationData } from './location';
import { BlockedUser } from './messaging/blocked-user.model';

export interface User {
  _id: string;
  firstName: string;
  lastName: string;
  imageUrl?: string;
  email: string;
  password: string;
  bio?: string;
  location?: LocationData;
  isAdmin?: boolean;
  blockedUsers?: Array<BlockedUser>;
}
