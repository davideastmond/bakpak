import { UserClient } from '@/app/clients/user/user-client';
import theme from '@/app/theme';
import { MessageThread } from '@/models/messaging/message-thread.model';
import { SecureUser } from '@/types/secure-user';
import { Box, Typography } from '@mui/material';
import { useEffect, useState } from 'react';
import { BaseCard } from '../base-card/BaseCard';
import { SummarySection } from '../summary-section/SummarySection';

export const AvatarMessageHeaderCard = ({
  user,
  onMenuItemClick,
}: {
  user: Partial<SecureUser>;
  onMenuItemClick?: (e: any) => void;
}) => {
  return (
    <BaseCard users={user}>
      <Box ml={2} width='100%'>
        <Box>
          {/* TODO: This needs to be styled differently if it's a thread info */}
          <Typography
            sx={{ fontWeight: 'bold', color: theme.palette.primary.charcoal, textAlign: 'left' }}
          >
            {/* TODO: Fix */}
            {user?.firstName} {user?.lastName}
          </Typography>
        </Box>
        {/* TODO: Fix */}
        <SummarySection cardType='info' user={user} onMenuClick={onMenuItemClick} />
        <Box>{/* This section is for time ago or some context menu */}</Box>
      </Box>
    </BaseCard>
  );
};

export const CurrentThreadRecipientsCard = ({
  threadContext,
  baseUser,
}: {
  threadContext: MessageThread;
  baseUser: Partial<SecureUser>;
}) => {
  const [recipients, setRecipients] = useState<SecureUser[]>([]);
  console.log('cotxt id', threadContext._id);

  useEffect(() => {
    if (threadContext) {
      fetchRecipients();
    }
  }, [threadContext]);

  const fetchRecipients = async () => {
    const fetchedRecipients = await Promise.all(
      threadContext.recipients
        .filter((userId: string) => userId !== baseUser?._id)
        .map((userId: string) => UserClient.getUserById(userId)),
    );

    setRecipients(fetchedRecipients as SecureUser[]);
  };

  return (
    <Box>
      {recipients &&
        recipients.map((recipient: Partial<SecureUser>) => (
          <AvatarMessageHeaderCard user={recipient} key={recipient._id} />
        ))}
    </Box>
  );
};
