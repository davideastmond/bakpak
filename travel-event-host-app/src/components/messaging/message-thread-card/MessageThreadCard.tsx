'use client';
import { UserClient } from '@/app/clients/user/user-client';
import theme from '@/app/theme';
import { MessageThread } from '@/models/messaging/message-thread.model';
import { SecureUser } from '@/types/secure-user';
import { Box, Typography } from '@mui/material';
import dayjs from 'dayjs';
import { useEffect, useState } from 'react';
import { BaseCard } from '../base-card/BaseCard';
import { SummarySectionMenuActions } from '../summary-section/SummarySection';
/* 
 Looking at the meetup.com website, the other sections have two variations:
 1. Message thread version:
    (middle column)
    - User first and name
    - Excerpt of latest message
    - Time ago (on the third column)

  2. (Middle column)
    - User first name in bold
    - Location icon with the user's location
  
  3. Version 2, with a dropdown menu to add or remove (for new message), otherwise a context menu with [view profile, mute, block, report]
*/
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

  const filteredUsers = threadContext.recipients.filter((userId) => userId !== baseUser?._id);
  useEffect(() => {
    filteredUsers.map((userId) =>
      UserClient.getUserById(userId).then((user) => setRecipients([...recipients!, user!])),
    );
  }, []);

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
        {/* TODO: Fix */}
        {/* <SummarySection cardType='thread' user={user} /> */}
        <Box>
          {/* Blurb of the last message */}
          <Typography sx={{ color: theme.palette.primary.greyDisabled, fontWeight: 'light' }}>
            {threadContext.messages[threadContext.messages.length - 1].body}
          </Typography>
        </Box>

        <Box>{/* This section is for time ago or some context menu */}</Box>
      </Box>
    </BaseCard>
  );
};

const renderMultipleRecipientNames = (users: Partial<SecureUser>[]): string => {
  return users.map((user) => `${user.firstName}`).join(', ');
};

// For the messages. This should be rendered in a container that controls how the message displays to the left or to the right.
export const MessageBlurb = ({
  user,
  body,
  position,
  timestamp,
}: {
  user: Partial<SecureUser>;
  body: string;
  position: 'start' | 'end';
  timestamp: Date;
}) => {
  return (
    <BaseCard users={user} backgroundColor={'white'} reverseFlow={position === 'end'}>
      <Box
        borderRadius={'5px'}
        p={2}
        maxWidth={'600px'} // This needs to be responsive
        ml={1}
        mr={position === 'end' ? 1 : 0}
        bgcolor={
          position === 'start' ? theme.palette.primary.whiteSmoke : theme.palette.primary.aliceBlue
        }
      >
        <Box>
          <Typography sx={{ color: theme.palette.primary.charcoal }}>{body}</Typography>
        </Box>
        <Box>
          <Box display='flex' justifyContent={'right'}>
            <Typography sx={{ color: theme.palette.primary.greyDisabled, fontSize: '0.7rem' }}>
              {dayjs(timestamp).format('h:mm A')}
            </Typography>
          </Box>
        </Box>
      </Box>
    </BaseCard>
  );
};

export const MessageBlurbContainer = ({
  children,
  position,
}: {
  children: JSX.Element;
  position: 'start' | 'end';
}) => {
  return (
    <Box display='flex' justifyContent={position === 'start' ? 'flex-start' : 'flex-end'}>
      {children}
    </Box>
  );
};

export const TimestampStrip = ({ dateString }: { dateString: string }) => {
  return (
    <Box display='flex' justifyContent={'center'} padding={1}>
      <Typography sx={{ color: theme.palette.primary.greyDisabled, textTransform: 'uppercase' }}>
        {dateString}
      </Typography>
    </Box>
  );
};
