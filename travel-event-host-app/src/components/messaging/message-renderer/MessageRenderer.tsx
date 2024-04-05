import { UserClient } from '@/app/clients/user/user-client';
import { MessageThread } from '@/models/messaging/message-thread.model';
import { SecureUser } from '@/types/secure-user';
import dayjs from 'dayjs';
import { useEffect, useState } from 'react';
import { MessageBlurb, MessageBlurbContainer, TimestampStrip } from '../message-blurb/MessageBlurb';

export function MessageRenderer({
  threadContext,
  userId,
}: {
  threadContext: MessageThread;
  userId: string;
}) {
  const [contextUsers, setContextUsers] = useState<Partial<SecureUser>[] | null>(null);

  useEffect(() => {
    const fetchContextUsers = async () => {
      // TODO: We could improve this by using allSettled and filtering out the rejected promises
      const users = await Promise.all(
        threadContext.recipients.map((recipient) => UserClient.getUserById(recipient)),
      );
      setContextUsers(users as Partial<SecureUser>[]);
    };

    fetchContextUsers();
  }, [threadContext]);

  /*
    This logic is responsible for rendering the messages with the proper horizontal alignment.
    It will also group messages in timestamp buckets.
  */
  const render = () => {
    const messageElements: JSX.Element[] = [];
    let currentDate = null;
    if (threadContext.messages?.length > 0) {
      currentDate = threadContext.messages[0].timestamp;
      messageElements.push(
        <TimestampStrip
          key={currentDate.toString()}
          dateString={calculateDateCaption(currentDate)}
        />,
      );
    }

    // Iterate through each message in the thread and render it
    for (const message of threadContext.messages) {
      // If the current message's date is different from the previous message's date, add a new timestamp strip
      if (currentDate && !dayjs(message.timestamp).isSame(dayjs(currentDate), 'day')) {
        currentDate = message.timestamp;
        messageElements.push(
          <TimestampStrip
            key={currentDate.toString()}
            dateString={calculateDateCaption(currentDate)}
          />,
        );
      }
      const position = message.sender === userId ? 'end' : 'start';

      messageElements.push(
        <MessageBlurbContainer position={position} key={message._id}>
          <MessageBlurb
            body={message.body}
            position={position}
            user={contextUsers?.find((user) => user._id === message.sender) as SecureUser}
            timestamp={message.timestamp}
          />
        </MessageBlurbContainer>,
      );
    }
    return messageElements;
  };

  // iterate through each message and grab its created date.
  return contextUsers && render();
}

function calculateDateCaption(timestamp: Date): string {
  // This function will calculate how to display a date

  if (dayjs().isSame(dayjs(timestamp), 'day')) {
    return 'Today';
  }
  return dayjs(timestamp).format('MMM D, YYYY');
}
