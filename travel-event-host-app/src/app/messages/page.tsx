'use client';
import { CustomTextField } from '@/components/custom-fields/CustomFields';

import { MessageThreadCard } from '@/components/messaging/message-thread-card/MessageThreadCard';
import { Spinner } from '@/components/spinner/Spinner';
import { useAuthContext } from '@/lib/auth-context';
import { isValidMongoId } from '@/lib/utils/mongo-id-validation';
import { MessageThread } from '@/models/messaging/message-thread.model';
import { SecureUser } from '@/types/secure-user';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import EditIcon from '@mui/icons-material/Edit';
import LinearScaleIcon from '@mui/icons-material/LinearScale';
import SendIcon from '@mui/icons-material/Send';
import { Box, ButtonBase, Divider, IconButton, Menu, MenuItem, Typography } from '@mui/material';
import { useRouter, useSearchParams } from 'next/navigation';

import {
  AvatarMessageHeaderCard,
  CurrentThreadRecipientsCard,
} from '@/components/messaging/avatar-message-header-card/AvatarMessageHeaderCard';
import { MessageRenderer } from '@/components/messaging/message-renderer/MessageRenderer';
import { NewConversationHeader } from '@/components/messaging/new-conversation-header/NewConversationHeader';
import { AuthStatus } from '@/lib/auth-status';
import { Suspense, useEffect, useRef, useState } from 'react';
import { MessageClient } from '../clients/message/message-client';
import { UserClient } from '../clients/user/user-client';
import theme from '../theme';

export default function MessagePage() {
  //const [user, setUser] = useState<Partial<SecureUser> | undefined>(undefined);
  const [newMessageRecipients, setNewMessageRecipients] = useState<SecureUser[]>([]);

  const [threadContexts, setThreadContexts] = useState<MessageThread[]>([]);

  const [currentThreadContext, setCurrentThreadContext] = useState<string | null | undefined>(null); // This will hold the current thread ID. Should it be
  const [isNewMessage, setIsNewMessage] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [chatMessage, setChatMessage] = useState<string>('');
  const [firstLoad, setFirstLoad] = useState<boolean>(true);

  const sRef = useRef<HTMLDivElement>(null);

  // This will help with the message view in mobile
  const [responsiveMessageView, setResponsiveMessageView] = useState<'message' | 'thread'>(
    'message',
  );

  const [leftContainerHeaderContextMenuAnchorEl, setLeftContainerHeaderContextMenuAnchorEl] =
    useState<null | HTMLElement>(null);

  const [isNewMessageThreadMode, setIsNewMessageThreadMode] = useState<boolean>(false);

  const { session, status } = useAuthContext();
  const searchParams = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    initializeThreadContexts();
  }, [session]);

  const initializeThreadContexts = async () => {
    const targetUserId = searchParams.get('target');
    const newMessageParam = searchParams.get('newMessage');
    const fetchedThreadContexts = await fetchThreadContexts();

    // Even though it could be a new message, there could be a thread already existing between originator and recipient
    // If one does exist, we should set the current thread context to that and switch the isMessage flag to false.

    const existingThread = fetchedThreadContexts.find((thread) => {
      return (
        thread.originator === session?.user._id &&
        thread.recipients.length === 2 &&
        thread.recipients.includes(targetUserId as string)
      );
    });

    if (newMessageParam && !isNewMessage && isValidMongoId(targetUserId as string)) {
      if (!existingThread) {
        setIsNewMessage(true);
        fetchNewMessageUser(targetUserId as string);
      } else {
        router && router.replace('/messages');
        setCurrentThreadContext(existingThread._id);
      }
      return;
    }

    if (firstLoad && fetchedThreadContexts.length > 0) {
      setCurrentThreadContext(fetchedThreadContexts[0]._id);
      setFirstLoad(false);
      scrollToBottom();
    }
  };

  const fetchNewMessageUser = async (id: string) => {
    const targetUser = await UserClient.getUserById(id);
    setNewMessageRecipients([...newMessageRecipients, targetUser as SecureUser]);
  };

  const fetchThreadContexts = async (): Promise<MessageThread[]> => {
    // Fetch all the threads that the user is part of.
    // This will be used to render the message threads.
    // We will also need to fetch the last message in each thread.
    // We will also need to fetch the user's avatar and name.

    try {
      const threadContexts = await MessageClient.getAllThreadContexts();
      setThreadContexts(threadContexts);
      return threadContexts;
    } catch (e: any) {
      console.error(e);
      return [];
    }
  };

  const handleSendMessage = async (e: any) => {
    e.preventDefault();
    // We need to send the message to the server.
    // Grab context of the thread if available.
    // If it's a new message, we need to create a new thread.
    if (!chatMessage) return;
    if (chatMessage.trim().length < 1) return;

    if (isNewMessage) {
      setIsLoading(true);
      const newThreadMessage = await MessageClient.createThreadAndPostMessage({
        initiator: session?.user._id as string,
        recipients: newMessageRecipients.map((recipient) => recipient._id),
        message: chatMessage,
      });
      // Refresh the thread contexts
      await fetchThreadContexts();
      setChatMessage('');
      setIsNewMessage(false);
      setIsNewMessageThreadMode(false);
      setIsLoading(false);

      // When a new message is sent, set the thread context to that message
      if (newThreadMessage) {
        setCurrentThreadContext(newThreadMessage.id);
      }
      scrollToBottom();
      return;
    }

    if (!currentThreadContext) return;

    setIsLoading(true);
    await MessageClient.postMessageToThread({
      threadId: currentThreadContext,
      content: chatMessage,
    });
    setChatMessage('');
    await fetchThreadContexts();
    scrollToBottom();
    setIsLoading(false);
  };

  const handleDeleteThreadInContext = async () => {
    if (!currentThreadContext) return;

    setIsLoading(true);

    await MessageClient.patchDeleteRecipientFromThread(currentThreadContext);
    await fetchThreadContexts();

    // When a context is deleted, we should reset the current context
    setCurrentThreadContext(null);
    setIsLoading(false);
    setLeftContainerHeaderContextMenuAnchorEl(null);
  };

  const handleCancelNewMessage = () => {
    setIsNewMessageThreadMode(false);
    setCurrentThreadContext(null);

    // Clear the new
    setNewMessageRecipients([]);
    setIsNewMessage(false);
    setIsNewMessageThreadMode(false);
  };

  const handleAddNewMessageUser = async (userId: string) => {
    // We can check if the user is already in the list of recipients. If so, ignore. Otherwise, fetch from the server
    if (newMessageRecipients.find((recipient) => recipient._id === userId)) return;

    await fetchNewMessageUser(userId);
  };

  const handleRemoveNewMessageRecipient = (userId: string) => {
    // This removes a user from the potential new recipients list for new messages
    const filteredRecipients = newMessageRecipients.filter((recipient) => recipient._id !== userId);
    setNewMessageRecipients(filteredRecipients);
  };

  const handleThreadCardClicked = async (threadId: string) => {
    // We could check if the thread is already marked as read. If so, not do this request

    await MessageClient.patchMarkThreadAsRead(threadId);
    await fetchThreadContexts();
    // Mark a thread context as read
    setCurrentThreadContext(threadId);
    setIsNewMessageThreadMode(false);
    setNewMessageRecipients([]);

    // For mobile mode, we can set a toggle to indicate that when user clicks
    // the threadCard, switch to 'message mode'
    setResponsiveMessageView('message');
  };

  const scrollToBottom = () => {
    console.info('scrolling to bottom');
    if (sRef.current) {
      sRef.current.scrollTop = sRef.current.scrollHeight;
    }
  };

  if (status === AuthStatus.Unauthenticated) {
    return router.replace('/auth/signin');
  }

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
        {/* Back to messages button */}
        {responsiveMessageView === 'message' && (
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
            <BackToMessagesButton
              onClick={() => {
                setResponsiveMessageView('thread');
                setCurrentThreadContext(null);
              }}
            />
          </Box>
        )}

        <Box id='mainContainer' display='flex' gap={3}>
          <Box
            id='left-container-main'
            height='calc(calc(var(--pvh, 1vh)* 100) - 112px);'
            maxWidth={'900px'}
            width={'100%'}
            sx={{
              [theme.breakpoints.down('md')]: {
                display: responsiveMessageView === 'message' ? 'none' : 'block',
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
                {/* Left side header context menu (allow for deleting the thread context) */}
                <IconButton
                  onClick={(e) => setLeftContainerHeaderContextMenuAnchorEl(e.currentTarget)}
                >
                  <LinearScaleIcon sx={{ color: theme.palette.primary.charcoal }} />
                </IconButton>
                {/* Let's render a context menu here, which will delete the current context. */}
                <Menu
                  id='left-container-header-context-menu'
                  anchorEl={leftContainerHeaderContextMenuAnchorEl}
                  open={Boolean(leftContainerHeaderContextMenuAnchorEl)}
                  onClose={() => setLeftContainerHeaderContextMenuAnchorEl(null)}
                >
                  <MenuItem
                    disabled={Boolean(currentThreadContext === null)}
                    onClick={handleDeleteThreadInContext} // Here we send request to API to delete a threadContext
                  >
                    Delete Thread
                  </MenuItem>
                </Menu>
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
                {threadContexts.map((threadContext) => (
                  <MessageThreadCard
                    key={threadContext._id}
                    baseUser={session?.user}
                    threadContext={threadContext}
                    selected={currentThreadContext === threadContext._id}
                    onMessageThreadCardClicked={handleThreadCardClicked}
                  />
                ))}
              </Suspense>
            </Box>
            <Box bgcolor={'white'} p={2}>
              {/* Start a new message*/}
              <Box display='flex' justifyContent={'right'}>
                <IconButton
                  onClick={() => {
                    setCurrentThreadContext(null);
                    setIsNewMessageThreadMode(true);
                    setIsNewMessage(true);
                  }}
                  disabled={isNewMessageThreadMode}
                >
                  <EditIcon />
                </IconButton>
              </Box>
            </Box>
          </Box>
          {/* RIGHT CONTAINER */}
          <Box
            id='right-container-main'
            width='100%'
            height='fit-content'
            bgcolor={'white'}
            sx={{
              [theme.breakpoints.up('md')]: {
                maxWidth: '900px',
                borderRadius: '2%',
              },
              [theme.breakpoints.down('md')]: {
                display: responsiveMessageView === 'message' ? 'block' : 'none',
              },
            }}
          >
            {currentThreadContext === null && isNewMessage && (
              <Box id='newConversationHeader'>
                {/* Here is where we handle when user clicks a user search result dropdown item */}
                <NewConversationHeader
                  onCancelClicked={handleCancelNewMessage}
                  onSearchResultClicked={handleAddNewMessageUser}
                />
              </Box>
            )}
            {session && currentThreadContext && !isNewMessage && (
              <Box>
                <CurrentThreadRecipientsCard
                  threadContext={
                    threadContexts.find((context) => context._id === currentThreadContext)!
                  }
                  baseUser={session.user}
                />
              </Box>
            )}
            <Box id='right-container-header' p={2}>
              {/* This will have the chat avatar icon with location for new messages */}
              {isNewMessage && isNewMessageThreadMode && (
                <Box mb={3}>
                  <Typography sx={{ color: theme.palette.primary.charcoal }}>
                    Send message to:
                  </Typography>
                </Box>
              )}
              <Box display='flex'>
                {newMessageRecipients.map((recipient) => (
                  <AvatarMessageHeaderCard
                    key={recipient._id}
                    user={recipient}
                    showRemoveIcon
                    onRemoveIconClick={handleRemoveNewMessageRecipient}
                  />
                ))}
              </Box>
              <Divider
                orientation='horizontal'
                sx={{ borderColor: theme.palette.primary.backgroundColorLightPurple, mb: 2 }}
              />
            </Box>
            <Box
              id='right-message-parent-container'
              ref={sRef}
              sx={{
                overflowY: 'auto',
                maxHeight: '50vh',
              }}
            >
              <Box
                id='right-message-container'
                display={'flex'}
                flexDirection={'column'}
                justifyContent={'flex-end'}
                height={'60vh'}
              >
                {/* This is the space for the messages */}
                {currentThreadContext && session && (
                  <MessageRenderer
                    threadContext={
                      threadContexts.find(
                        (thread) => thread._id === currentThreadContext,
                      ) as MessageThread
                    }
                    userId={session.user._id}
                  />
                )}
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
                  maxRows={3}
                  placeholder='Send a message'
                  value={chatMessage}
                  onChange={(e) => setChatMessage(e.target.value)}
                  // TODO: This should be disabled if there are no users to send a message to
                  InputProps={{
                    endAdornment: (
                      <IconButton
                        disabled={isLoading || chatMessage.trim().length < 1}
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

const BackToMessagesButton = ({ onClick }: { onClick?: () => void }) => {
  return (
    <ButtonBase onClick={onClick}>
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
  );
};
