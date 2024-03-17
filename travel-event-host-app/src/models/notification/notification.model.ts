import { NotificationType } from './notification-type';

export interface Notification {
  type: NotificationType;
  referenceId: string; // id of the thing the notification is about (e.g. message thread id)
  targetUser: string; // user id of the person the notification is for
}
