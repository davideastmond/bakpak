import { Message } from './message.model';

export interface MessageThread {
  _id: string;
  originator: string; // user id of person who created the thread
  recipients: string[]; // user ids of people who are part of the thread at the current moment
  createdDate: Date;
  updatedDate: Date;
  messages: Message[]; // messages in the thread
}
