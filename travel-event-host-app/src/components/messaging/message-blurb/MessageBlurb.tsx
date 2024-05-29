import theme from '@/app/theme';
import { SecureUser } from '@/lib/definitions/secure-user';
import { Box, Typography } from '@mui/material';
import dayjs from 'dayjs';
import { BaseMessageCard } from '../base-message-card/Base-message-card';

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
    <BaseMessageCard
      users={user && user}
      backgroundColor={'white'}
      reverseFlow={position === 'end'}
    >
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
    </BaseMessageCard>
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
