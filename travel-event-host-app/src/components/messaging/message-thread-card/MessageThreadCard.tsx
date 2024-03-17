import { UserClient } from '@/app/clients/user/user-client';
import theme from '@/app/theme';
import { CustomGenericMuiAvatar } from '@/components/avatar/custom-generic-user-avatar/CustomGenericUserAvatar';
import { MultiAvatarComponent } from '@/components/avatar/multi-avatar/MultiAvatar';
import UserAvatar from '@/components/avatar/user-avatar/UserAvatar';
import { SearchInputField } from '@/components/event-search/search-input-field/SearchInputField';
import { MessageThread } from '@/models/messaging/message-thread.model';
import { SecureUser } from '@/types/secure-user';
import LinearScaleIcon from '@mui/icons-material/LinearScale';
import LocationPinIcon from '@mui/icons-material/LocationOn';
import { Box, ButtonBase, Menu, MenuItem, Typography } from '@mui/material';
import dayjs from 'dayjs';
import { useEffect, useState } from 'react';
import styles from './styles.module.css';
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
  onMenuItemClick?: (action: {
    type: SummarySectionMenuActions;
    context: { id: string; other?: any };
  }) => void;
}

export const MessageThreadCard = ({
  threadContext,
  baseUser,
  onMessageThreadCardClicked,
}: MessageThreadCardProps) => {
  const [recipients, setRecipients] = useState<Partial<SecureUser>[]>([]);

  const filteredUsers = threadContext.recipients.filter((userId) => userId !== baseUser._id);
  useEffect(() => {
    filteredUsers.map((userId) =>
      UserClient.getUserById(userId).then((user) => setRecipients([...recipients!, user!])),
    );
  }, []);

  const handleOnCardClicked = () => {
    onMessageThreadCardClicked?.(threadContext._id);
  };

  return (
    <BaseCard users={recipients} backgroundColor={'white'} onCardClicked={handleOnCardClicked}>
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
          {/* Blurn of the last message */}
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

export const AvatarMessageHeaderCard = ({
  user,
  onMenuItemClick,
}: {
  user: Partial<SecureUser>;
  onMenuItemClick: (e: any) => void;
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

const BaseCard = ({
  users,
  children,
  backgroundColor,
  reverseFlow,
  onCardClicked,
}: {
  users: Partial<SecureUser>[] | Partial<SecureUser>;
  children?: JSX.Element;
  backgroundColor?: string;
  reverseFlow?: boolean;
  onCardClicked?: () => void;
}) => {
  // The avatar needs to appear on the left or right
  return (
    <Box
      display='flex'
      bgcolor={backgroundColor || 'white'}
      padding={2}
      flexDirection={reverseFlow ? 'row-reverse' : 'row'}
      onClick={() => onCardClicked && onCardClicked()}
      sx={{
        '&:hover': {
          backgroundColor: theme.palette.primary.thirdColorIceLight,
          cursor: 'pointer',
        },
      }}
    >
      <Box className='avatarEnclosure'>
        {!Array.isArray(users) ? (
          <UserAvatar
            user={users as Partial<SecureUser>}
            imageClassName={styles.mesageCardAvatar}
            MuiAvatarComponent={<CustomGenericMuiAvatar theme={theme} />}
          />
        ) : (
          <MultiAvatarComponent users={users} />
        )}
      </Box>
      {children}
    </Box>
  );
};

export interface SummarySectionProps {
  cardType: 'thread' | 'info';
  user: Partial<SecureUser>;
  onMenuClick?: (action: {
    type: SummarySectionMenuActions;
    context: { id: string; other?: any };
  }) => void;
}

enum SummarySectionMenuActions {
  RemoveUser = 'removeUser',
}

const SummarySection = ({ cardType, user, onMenuClick }: SummarySectionProps) => {
  const [menuOpen, setMenuOpen] = useState<boolean>(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const handleClose = () => {
    setAnchorEl(null);
    setMenuOpen(false);
  };

  const handleAnchorMenu = (e: any) => {
    setAnchorEl(e.currentTarget);
    setMenuOpen(true);
  };

  const handleMenuItemClicked = (action: SummarySectionMenuActions) => {
    onMenuClick?.({ type: action, context: { id: user._id! } });
    handleClose();
  };

  if (cardType === 'thread') {
    // TODO: The text excerpt needs to be truncated if it's too long
    return (
      <Box>
        <Typography
          sx={{ color: theme.palette.primary.greyDisabled, textAlign: 'left' }}
          variant='body1'
        >
          Excerpt of latest message
        </Typography>
      </Box>
    );
  }

  // Return info (location and something else?)
  return (
    <Box display='flex' width={'100%'}>
      <Box display='flex' flexGrow={3}>
        <Box>
          <LocationPinIcon sx={{ color: theme.palette.primary.greyDisabled }} />
        </Box>
        <Box>
          <Typography variant='body1' sx={{ color: theme.palette.primary.greyDisabled }}>
            {user?.location?.city}, {user?.location?.country}
          </Typography>
        </Box>
      </Box>
      <Box flexGrow={1} display='flex' justifyContent={'right'}>
        <ButtonBase onClick={handleAnchorMenu}>
          <LinearScaleIcon sx={{ color: theme.palette.primary.charcoal }} />
        </ButtonBase>
      </Box>
      <Menu
        id='simple-menu'
        anchorEl={anchorEl}
        open={menuOpen}
        onClose={handleClose}
        MenuListProps={{
          'aria-labelledby': 'basic-button',
        }}
      >
        <MenuItem onClick={() => handleMenuItemClicked(SummarySectionMenuActions.RemoveUser)}>
          <Typography sx={{ color: theme.palette.primary.burntOrangeCancelError }}>
            Remove
          </Typography>
        </MenuItem>
      </Menu>
    </Box>
  );
};

export function NewConversationHeader() {
  return (
    <Box p={2}>
      <Box id='header-with-cancel-enclosure' display='flex' mb={1} justifyContent={'space-between'}>
        <Box>
          <Typography
            sx={{
              color: theme.palette.primary.charcoal,
              fontWeight: 'bold',
              fontSize: '1.25rem',
              lineHeight: '1.75em',
            }}
          >
            New Conversation
          </Typography>
        </Box>
        <Box>
          <ButtonBase>
            <Typography
              sx={{
                color: theme.palette.primary.primaryColorDarkBlue,
                textDecoration: 'underline',
              }}
            >
              Cancel
            </Typography>
          </ButtonBase>
        </Box>
      </Box>
      <Box>
        {/* Search for people box */}
        <SearchInputField
          handleSearch={() => {}}
          keyword=''
          fullWidth={true}
          placeholder='Search people'
        />
      </Box>
    </Box>
  );
}

// For the messages. This should be rendered in a container that controls how the message displays to the left or to the right.
export const MessageBlurb = ({
  user,
  body,
  position,
}: {
  user: Partial<SecureUser>;
  body: string;
  position: 'start' | 'end';
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
        <Box>{/* {Timestamp needs to go here} */}</Box>
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

export const TimestampStrip = ({ timestamp }: { timestamp: Date }) => {
  return (
    <Box display='flex' justifyContent={'center'} padding={1}>
      <Typography sx={{ color: theme.palette.primary.greyDisabled, textTransform: 'uppercase' }}>
        {dayjs(timestamp).format('MMM D, YYYY')}
      </Typography>
    </Box>
  );
};
