import { UserClient } from '@/app/clients/user/user-client';
import { MessageThread } from '@/models/messaging/message-thread.model';
import { SecureUser } from '@/types/secure-user';
import { useEffect, useState } from 'react';
import { MessageBlurb, MessageBlurbContainer } from '../message-thread-card/MessageThreadCard';

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
      const users = await Promise.all(
        threadContext.recipients.map((recipient) => UserClient.getUserById(recipient)),
      );
      setContextUsers(users as Partial<SecureUser>[]);
    };

    fetchContextUsers();
  }, []);

  // Then render the messages
  return (
    contextUsers &&
    threadContext.messages.map((message, index) => {
      const position = message.sender === userId ? 'end' : 'start';
      return (
        <MessageBlurbContainer position={position} key={message._id}>
          <MessageBlurb
            body={message.body}
            position={position}
            user={contextUsers.find((user) => user._id === message.sender) as SecureUser}
          />
        </MessageBlurbContainer>
      );
    })
  );
}
