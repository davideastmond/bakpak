export interface Message {
  _id?: string;
  parentThreadId: string; // id of the thread this message is part of
  sender: string; // user id of the person who sent the message
  body: string;
  timestamp: Date;
  recipients: string[]; // user ids of people who received the message
  readStatus: { [key: string]: boolean }; // key is user id, value is whether the user has read the message
}
