'use client';
import { CustomTextField } from '@/components/custom-fields/CustomFields';

import {
  AvatarMessageHeaderCard,
  NewConversationHeader,
} from '@/components/messaging/message-thread-card/MessageThreadCard';
import { Spinner } from '@/components/spinner/Spinner';
import { useAuthContext } from '@/lib/auth-context';
import { isValidMongoId } from '@/lib/utils/mongo-id-validation';
import { MessageThread } from '@/models/messaging/message-thread.model';
import { SecureUser } from '@/types/secure-user';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import EditIcon from '@mui/icons-material/Edit';
import LinearScaleIcon from '@mui/icons-material/LinearScale';
import SendIcon from '@mui/icons-material/Send';
import { Box, ButtonBase, Divider, IconButton, Typography } from '@mui/material';
import { useSearchParams } from 'next/navigation';
import { Suspense, useEffect, useState } from 'react';
import { MessageClient } from '../clients/message/message-client';
import { UserClient } from '../clients/user/user-client';
import theme from '../theme';

export default function MessagePage() {
  //const [user, setUser] = useState<Partial<SecureUser> | undefined>(undefined);
  const [newMessageRecipients, setNewMessageRecipients] = useState<SecureUser[]>([]);

  const [threadContexts, setThredContexts] = useState<MessageThread[]>([]);

  const [currentThreadContext, setCurrentThreadContext] = useState<string | null | undefined>(null); // This will hold the current thread ID. Should it be
  const [isNewMessage, setIsNewMessage] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [chatMessage, setChatMessage] = useState<string>('');
  const { session } = useAuthContext();

  const searchParams = useSearchParams();

  useEffect(() => {
    const targetUserId = searchParams.get('target');
    const isNewMessage = searchParams.get('newMessage');

    // If it's a new message, we fetch the target user by Id.
    if (isNewMessage && isValidMongoId(targetUserId as string)) {
      setIsNewMessage(true);
      fetchNewMessageUser(targetUserId as string);
    }
  }, []);

  useEffect(() => {
    //fetchThreadContexts();
  }, [threadContexts]);

  const fetchNewMessageUser = async (id: string) => {
    const targetUser = await UserClient.getUserById(id);
    setNewMessageRecipients([...newMessageRecipients, targetUser as SecureUser]);
  };

  const fetchThreadContexts = async () => {
    // Fetch all the threads that the user is part of.
    // This will be used to render the message threads.
    // We will also need to fetch the last message in each thread.
    // We will also need to fetch the user's avatar and name.

    const threadContexts = await MessageClient.getAllThreadContexts();
    setThredContexts(threadContexts);
    console.log('64', threadContexts);
  };

  const handleSendMessage = async () => {
    // We need to send the message to the server.
    // Grab context of the thread if available.
    // If it's a new message, we need to create a new thread.
    if (isNewMessage) {
      const newThreadContextId = await MessageClient.createThreadAndPostMessage({
        initiator: session?.user._id as string,
        recipients: newMessageRecipients.map((recipient) => recipient._id),
        message: chatMessage,
      });
      console.log(newThreadContextId);
    }
  };
  return (
    <Box
      padding='20px'
      sx={{
        [theme.breakpoints.down('md')]: {
          padding: 0,
        },
      }}
    >
      <Box>
        <Box
          bgcolor={theme.palette.primary.thirdColorIceLight}
          p={1}
          mt={1}
          mb={1}
          sx={{
            [theme.breakpoints.up('md')]: {
              display: 'none',
            },
          }}
        >
          <ButtonBase>
            <Box display='flex'>
              <ArrowBackIcon sx={{ color: theme.palette.primary.charcoal, alignSelf: 'center' }} />
              <Typography
                sx={{
                  color: theme.palette.primary.charcoal,
                  fontWeight: 'bold',
                  fontSize: '0.8rem',
                  ml: 1,
                }}
              >
                Back to messages
              </Typography>
            </Box>
          </ButtonBase>
        </Box>

        <Box id='mainContainer' display='flex' gap={3}>
          <Box
            id='left-container-main'
            height='calc(calc(var(--pvh, 1vh)* 100) - 112px);'
            width={'500px'}
            minWidth={'500px'}
            sx={{
              [theme.breakpoints.down('md')]: {
                display: 'none',
              },
            }}
          >
            <Box
              id='left-container-header'
              bgcolor={'white'}
              display='flex'
              justifyContent={'space-between'}
              padding={2}
            >
              <Box>
                <Typography
                  sx={{
                    color: theme.palette.primary.charcoal,
                    fontWeight: 'bold',
                    fontSize: '1.25rem',
                    lineHeight: '1.75em',
                  }}
                >
                  Messages
                </Typography>
              </Box>
              <Box>
                <ButtonBase>
                  <Typography
                    sx={{
                      color: theme.palette.primary.thirdColorlightBlack,
                      fontWeight: '500',
                      fontSize: '1.25rem',
                      lineHeight: '1.75em',
                    }}
                  >
                    Event Chats
                  </Typography>
                </ButtonBase>
              </Box>
              <Box>
                <IconButton>
                  <LinearScaleIcon sx={{ color: theme.palette.primary.charcoal }} />
                </IconButton>
              </Box>
            </Box>
            <Box
              display='flex'
              flexDirection={'column'}
              gap={'5px'}
              bgcolor={theme.palette.primary.thirdColorIceLight}
            >
              <Suspense fallback={<Spinner />}>
                {/* Message thread needs to be rendered */}
                {/* <MessageThreadCard user={user!} /> */}
              </Suspense>
            </Box>
            <Box bgcolor={'white'} p={2}>
              {/* Edit icon */}
              <Box display='flex' justifyContent={'right'}>
                <IconButton>
                  <EditIcon />
                </IconButton>
              </Box>
            </Box>
          </Box>
          {/* RIGHT CONTAINER */}
          <Box
            id='right-container-main'
            width='100%'
            height='85vh'
            bgcolor={'white'}
            sx={{
              [theme.breakpoints.up('md')]: {
                maxWidth: '900px',
                borderRadius: '2%',
              },
            }}
          >
            <Box id='newConversationHeader'>
              <NewConversationHeader />
            </Box>
            <Box id='right-container-header'>
              {/* This will have the chat avatar icon with location for new messages */}
              {/*  */}
              {/* <AvatarMessageHeaderCard user={user!} /> */}
              {newMessageRecipients.map((recipient) => (
                <AvatarMessageHeaderCard
                  key={recipient._id}
                  user={recipient}
                  onMenuItemClick={(e) => console.log(e)}
                />
              ))}
              <Divider
                orientation='horizontal'
                sx={{ borderColor: theme.palette.primary.backgroundColorLightPurple, mb: 2 }}
              />
            </Box>
            <Box
              id='right-message-parent-container'
              sx={{
                overflowY: 'auto',
                maxHeight: '58vh',
              }}
            >
              <Box
                id='right-message-container'
                display={'flex'}
                flexDirection={'column'}
                justifyContent={'flex-end'}
                minHeight={'58vh'}
              >
                {/* This is the space for the messages */}
                {/* <MessageBlurbContainer position='start'>
                  <MessageBlurb
                    user={user!}
                    body='Beginning Here! There is some text that needs to be display'
                    position='start'
                  />
                </MessageBlurbContainer> */}
                {/* <MessageBlurbContainer position='end'>
                  <MessageBlurb
                    user={user!}
                    body='Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.'
                    position='end'
                  />
                </MessageBlurbContainer> */}
              </Box>
            </Box>
            <Box id='right-container-footer' alignSelf={'baseline'} marginBottom={0} padding={2}>
              {/* Send message text input */}
              <Box id='right-container-message-input'>
                <CustomTextField
                  fullWidth
                  multiline
                  inputProps={{
                    maxLength: 500,
                  }}
                  maxRows={4}
                  placeholder='Send a message'
                  value={chatMessage}
                  onChange={(e) => setChatMessage(e.target.value)}
                  // TODO: This should be disabled if there are no users to send a message to
                  InputProps={{
                    endAdornment: (
                      <IconButton
                        disabled={chatMessage.trim().length < 1}
                        onClick={handleSendMessage}
                      >
                        <SendIcon sx={{ color: theme.palette.primary.primaryColorDarkBlue }} />
                      </IconButton>
                    ),
                  }}
                />
                <Box id='characterCount'>
                  <Typography
                    variant='caption'
                    sx={{ color: theme.palette.primary.thirdColorlightBlack }}
                  >
                    {chatMessage.length} / 500
                  </Typography>
                </Box>
              </Box>
            </Box>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
