'use client';
import { UserClient } from '@/app/clients/user/user-client';
import theme from '@/app/theme';
import { MessageThread } from '@/models/messaging/message-thread.model';
import { SecureUser } from '@/types/secure-user';
import { Box, Typography } from '@mui/material';
import { useEffect, useState } from 'react';
import { BaseCard } from '../base-card/BaseCard';
import { SummarySectionMenuActions } from '../summary-section/SummarySection';
import { threadHasUnreadMessages } from '../utils/unread-message';
import styles from './styles.module.css';

interface MessageThreadCardProps {
  baseUser: Partial<SecureUser>;
  threadContext: MessageThread;
  onMessageThreadCardClicked?: (threadContextId: string) => void;
  selected?: boolean;
  onMenuItemClick?: (action: {
    type: SummarySectionMenuActions;
    context: { id: string; other?: any };
  }) => void;
}

export const MessageThreadCard = ({
  threadContext,
  baseUser,
  onMessageThreadCardClicked,
  selected,
}: MessageThreadCardProps) => {
  const [recipients, setRecipients] = useState<Partial<SecureUser>[]>([]);

  useEffect(() => {
    getRecipientUsers();
  }, []);

  const getRecipientUsers = async () => {
    const filteredUsers = threadContext.recipients.filter((userId) => userId !== baseUser?._id);

    const recipientUsers = await Promise.all(
      filteredUsers.map((userId) => UserClient.getUserById(userId)),
    );
    setRecipients(recipientUsers as Partial<SecureUser>[]);
  };

  const handleOnCardClicked = () => {
    onMessageThreadCardClicked?.(threadContext._id);
  };

  return (
    <BaseCard
      users={recipients}
      backgroundColor={selected ? theme.palette.primary.aliceBlue : 'white'}
      onCardClicked={handleOnCardClicked}
      boxEnclosureStyles={{
        border: selected ? `1px solid ${theme.palette.primary.primaryColorDarkBlue}` : 'none',
        borderRadius: '5px',
      }}
    >
      <Box ml={2} width='100%'>
        <Box>
          {/* TODO: This needs to be styled differently if it's a thread info */}
          <Typography sx={{ color: theme.palette.primary.charcoal, textAlign: 'left ' }}>
            {/* TODO: what if it's a multi */}
            {renderMultipleRecipientNames(recipients)}
          </Typography>
        </Box>
        <Box>
          {/* Blurb of the last message */}
          <Typography
            sx={{
              color: theme.palette.primary.greyDisabled,
              fontWeight: 'light',
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
            }}
          >
            {threadContext.messages[threadContext.messages.length - 1].body}
          </Typography>
        </Box>
        {threadHasUnreadMessages(threadContext, baseUser._id!) && (
          <Box className='unread-message-indicator' display='flex' justifyContent={'right'}>
            <Box className={styles.newDot} />
          </Box>
        )}
      </Box>
    </BaseCard>
  );
};

const renderMultipleRecipientNames = (users: Partial<SecureUser>[]): string => {
  return users.map((user) => `${user.firstName}`).join(', ');
};
