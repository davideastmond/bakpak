import { MessageThread } from '@/models/messaging/message-thread.model';

export const threadHasUnreadMessages = (
  threadContext: MessageThread,
  baseUserId: string,
): boolean => {
  return threadContext.messages.some(
    (message) => message.readStatus && message.readStatus[baseUserId] === false,
  );
};
