'use client';
import { EventClient } from '@/app/clients/event/event-client';

import theme from '@/app/theme';
import { CommonButton } from '@/components/common-button/Common-Button';

import { UserClient } from '@/app/clients/user/user-client';
import { CustomGenericMuiAvatar } from '@/components/avatar/custom-generic-user-avatar/CustomGenericUserAvatar';
import UserAvatar from '@/components/avatar/user-avatar/UserAvatar';
import { ConfirmationDialog } from '@/components/confirmation-dialog/ConfirmationDialog';
import { EventEditor } from '@/components/event-editor/EventEditor';
import { Spinner } from '@/components/spinner/Spinner';
import UserListContainer from '@/components/user-list-container/UserListContainer';
import { IAppActionType, useAppContext } from '@/lib/app-context';
import { useAuthContext } from '@/lib/auth-context';
import { AuthStatus } from '@/lib/auth-status';
import { CategoryDict } from '@/lib/category-dictionary';
import { CoordsHelper } from '@/lib/coords-helper/coords-helper';
import { UserEvent } from '@/models/user-event';
import { SecureUser } from '@/types/secure-user';
import { Loader } from '@googlemaps/js-api-loader';
import { DeleteForever } from '@mui/icons-material';
import CheckIcon from '@mui/icons-material/Check';
import NotInterestedIcon from '@mui/icons-material/NotInterested';
import { Alert, Backdrop, Box, Chip, Snackbar, Typography, styled } from '@mui/material';
import dayjs from 'dayjs';
import { signIn } from 'next-auth/react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Dispatch, SetStateAction, Suspense, useEffect, useState } from 'react';
import { isEventInPast } from '../helpers/event-utils';
import styles from './styles.module.css';
interface EventDetailsPageProps {
  params: {
    id: string;
  };
}

// Google maps loader
const mapLoader = new Loader({
  apiKey: process.env.NEXT_PUBLIC_GOOGLE_API_KEY as string,
  version: 'weekly',
  libraries: ['places', 'maps'],
});

/* 
  - Event details page:
  - Authenticated users: we need to find out if the user is attending the event and render the appropriate button
  - Unauthenticated users: show the Attend button, but its link should redirect to the sign-in page
*/
export default function EventDetailsPage({ params: { id } }: EventDetailsPageProps) {
  const { session, status } = useAuthContext();
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const [userEvent, setUserEvent] = useState<UserEvent | undefined>(undefined); // This is the event context for this page

  // This is the event host user context.
  const [eventHost, setEventHost] = useState<Partial<SecureUser> | undefined>(undefined);

  const [hasImageError, setHasImageError] = useState<boolean>(false);
  const [apiError, setApiError] = useState<string | undefined>(undefined);
  const [confirmUnregisterDialogOpen, setConfirmUnregisterDialogOpen] = useState<boolean>(false);
  const [eventParticipants, setEventParticipants] = useState<
    { _id: string; firstName: string; lastName: string }[]
  >([]);

  const [eventEditorModalOpen, setEventEditModalOpen] = useState<boolean>(false);
  const [eventUpdateSnackbarOpen, setEventUpdateSnackbarOpen] = useState<boolean>(false);
  const [googleMap, setGoogleMap] = useState<google.maps.Map | undefined>(undefined);

  const { appDispatch } = useAppContext();
  const router = useRouter();

  useEffect(() => {
    fetchEvent();
  }, [session]);

  useEffect(() => {
    const runMapLoader = async () => {
      if (userEvent?.location?.coords) {
        const mapOptions: google.maps.MapOptions = {
          center: {
            lat: CoordsHelper.toFloat(userEvent!.location.coords.lat as any) || 0,
            lng: CoordsHelper.toFloat(userEvent!.location.coords.lng as any) || 0,
          },
          zoom: 15,
          mapId: 'googleMapEventLocation',
        };

        const { Map } = await mapLoader.importLibrary('maps');
        const { AdvancedMarkerElement } = await mapLoader.importLibrary('marker');

        const mapObject = new Map(
          document.getElementById('googleMapEventLocation') as HTMLElement,
          mapOptions,
        );

        setGoogleMap(mapObject);

        // Create a marker for the event location
        new AdvancedMarkerElement({
          position: mapOptions.center,
          map: mapObject,
          title: userEvent.title,
        });
      }
    };
    runMapLoader();
  }, [userEvent]);

  const fetchEvent = async () => {
    try {
      setIsLoading(true);
      const fetchedEventData = await EventClient.getEventById(id);
      setUserEvent(fetchedEventData);
      const eventHostInfo = await UserClient.getUserById(fetchedEventData?.eventCreatorId!, [
        'firstName',
        'lastName',
        'imageUrl',
      ]);
      setEventHost(eventHostInfo);

      const fetchedEventParticipants = await EventClient.getEventParticipants(id);
      setEventParticipants(fetchedEventParticipants.users);
      setIsLoading(false);
    } catch (e: any) {
      console.log(e.message);
    }
  };

  const handleAttendButtonClicked = async () => {
    setIsLoading(true);
    if (status === AuthStatus.Authenticated) {
      setApiError(undefined);
      try {
        await EventClient.registerUserForEvent(id, session?.user?._id!);
        // If ok, refetch the event to get the updated participants list
        await fetchEvent();
      } catch (error: any) {
        setApiError(
          error.message ||
            'Sorry, we encountered an error and were unable to register you for this event.',
        );
      } finally {
        setIsLoading(false);
      }
    } else {
      // Redirect user to sign in as they are not authenticated
      signIn();
    }
  };

  const handleUnregisterButtonClicked = () => {
    // This action will cause a confirmation dialog to appear
    setConfirmUnregisterDialogOpen(true);
  };

  const completeUnregistrationAction = async () => {
    // User has confirmed unregistration and we can proceed
    setIsLoading(true);
    try {
      await EventClient.unregisterUserForEvent(id, session?.user?._id!);
      await fetchEvent();
    } catch (error: any) {
      setApiError(
        error.message ||
          'Sorry, we encountered an error and were unable to unregister you from this event.',
      );
    }
  };

  const handleDeleteEventButtonClicked = async () => {
    // This action will cause a confirmation dialog to appear
  };

  const isSessionUserAttendingEvent = (): boolean => {
    return !!userEvent?.participants.find((p) => p.userId === session?.user?._id);
  };

  const isSessionUserEventHost = (): boolean => {
    return userEvent?.eventCreatorId === session?.user?._id;
  };

  const handleEventUpdated = async () => {
    // Refresh the event
    await fetchEvent();
    setEventEditModalOpen(false);
    setEventUpdateSnackbarOpen(true);
  };

  const handleSnackbarClose = (e: React.SyntheticEvent | Event, reason?: string) => {
    if (reason === 'clickaway') {
      return;
    }
    setEventUpdateSnackbarOpen(false);
  };

  return (
    <Box>
      <Backdrop open={isLoading}>
        <Spinner />
      </Backdrop>
      <Suspense fallback={<Spinner />}>
        <StyledContentContainer
          p={'10%'}
          className='upperContent'
          sx={{
            background:
              'linear-gradient(118.98deg, rgba(0, 62, 220, 0.3) -2.11%, rgba(39, 52, 105, 0.282) 63.58%)',
          }}
        >
          {/* If there is no imageUrl for the event the image section will not render */}
          {!hasImageError && getEventImage(setHasImageError, userEvent?.imageUrl)}
          <Box className='eventTitle'>
            <Typography
              fontSize={['1.2rem', '1.2rem', '1.5rem', '2rem', '2.5rem']}
              fontWeight={'bold'}
              color={theme.palette.primary.navyBlue}
            >
              {userEvent?.title}
            </Typography>
          </Box>
          <Box className='hostedBy' mt={2} mb={2}>
            <Typography
              fontWeight={'bold'}
              fontSize={['1rem', '1rem', '1.3rem', '1.6rem', '1.8rem']}
              color={theme.palette.primary.charcoal}
            >
              Hosted by
            </Typography>
            <Box>
              <Box
                display='flex'
                justifyContent={'center'}
                sx={{
                  [theme.breakpoints.up('md')]: {
                    justifyContent: 'flex-start',
                  },
                }}
              >
                <UserAvatar
                  onAvatarClicked={() => {
                    appDispatch!({ type: IAppActionType.SET_LOADING });
                    router.push(`/users/${eventHost?._id}`);
                  }}
                  user={eventHost}
                  imageClassName={styles.eventHostImage}
                  MuiAvatarComponent={<CustomGenericMuiAvatar theme={theme} />}
                />
              </Box>
              <Box>
                <Typography
                  fontSize={['1rem', '1rem', '1.3rem', '1.6rem', '1.8rem']}
                  color={theme.palette.primary.charcoal}
                >
                  <Suspense fallback={<Spinner />}>
                    {`${eventHost?.firstName} ${eventHost?.lastName}`}
                  </Suspense>
                </Typography>
              </Box>
            </Box>
          </Box>
          {status === AuthStatus.Authenticated && isSessionUserEventHost() && (
            <Box>
              <Box>
                <Chip color='success' label="I'm hosting this."></Chip>
              </Box>
              <Box className='editEventButton'>
                <CommonButton
                  onButtonClick={() => setEventEditModalOpen(true)}
                  label='Edit event'
                  variant='text'
                  textColor={theme.palette.primary.lightIndigo}
                  baseButtonStyles={{
                    fontSize: ['0.8rem', '0.8rem', '1rem', '1.2rem', '1.4rem'],
                    textDecoration: 'underline',
                  }}
                />
              </Box>
            </Box>
          )}
          <Box
            className='dateTimeBlock'
            display={'flex'}
            sx={{
              '&.dateTimeBlock': {
                background: '#1D275F',
                boxShadow: '0px 4px 4px rgba(0, 0, 0, 0.25)',
              },
              [theme.breakpoints.down('md')]: {
                flexDirection: 'column',
              },
            }}
          >
            <Box sx={{ borderRight: `1px solid white` }}>
              <Typography
                p={2}
                className='someClass'
                fontWeight={'semibold'}
                sx={{
                  [theme.breakpoints.down('md')]: {
                    textAlign: 'center',
                  },
                }}
                fontSize={['0.8rem', '1rem', '1.2rem', '1.4rem', '1.6rem']}
              >
                Time & Location
              </Typography>
            </Box>
            <Box>
              {userEvent ? (
                <Box>
                  <Box>
                    <Typography
                      p={'5px'}
                      className='someClass'
                      fontWeight={'semibold'}
                      fontSize={['0.8rem', '1rem', '1.2rem', '1.4rem', '1.6rem']}
                    >
                      {formatDateRange(
                        userEvent.startDate,
                        userEvent.endDate,
                        userEvent.location.timezone?.name,
                      )}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography
                      p={'5px'}
                      className='someClass'
                      fontWeight={'semibold'}
                      fontSize={['0.8rem', '1rem', '1.2rem', '1.4rem', '1.6rem']}
                    >
                      {userEvent.location.formattedAddress}
                    </Typography>
                  </Box>
                </Box>
              ) : (
                <Spinner />
              )}
            </Box>
          </Box>
          {/* Google map here. I can be conditionally rendered */}

          <Box mt={2}>
            <Box
              id='googleMapEventLocation'
              sx={{
                width: '100%',
                height: googleMap ? '300px' : '0px',
                borderRadius: '10px',
                boxShadow: '0px 4px 4px rgba(0, 0, 0, 0.25)',
                maxWidth: '1000px',
              }}
            ></Box>
          </Box>

          <Box className='eventDetailsContainer' mt={2}>
            <Box className='eventDetailsHeader'>
              <Typography
                fontSize={['1.1rem', '1.1rem', '1.5rem', '1.6rem', '1.8rem']}
                fontWeight={'bold'}
                color={theme.palette.primary.navyBlue}
              >
                Event Details
              </Typography>
            </Box>
            {userEvent && (
              <Box className='eventDetailsContent' mb={3}>
                <Typography
                  fontSize={['0.8rem', '0.8rem', '1rem', '1.2rem', '1.4rem']}
                  color={theme.palette.primary.charcoal}
                  sx={{ whiteSpace: 'pre-line' }}
                >
                  {userEvent?.description}
                </Typography>
              </Box>
            )}
          </Box>
          <Box className='eventDetailsContent' mt={2}>
            <Box className='eventDetailsHeader'>
              <Typography
                fontSize={['1.1rem', '1.1rem', '1.5rem', '1.6rem', '1.8rem']}
                fontWeight={'bold'}
                color={theme.palette.primary.navyBlue}
              >
                In categories
              </Typography>
            </Box>
            {userEvent?.categories.length === 0 && (
              <Typography
                fontSize={['0.8rem', '0.8rem', '1rem', '1.2rem', '1.4rem']}
                fontStyle={'italic'}
                color={theme.palette.primary.charcoal}
                sx={{ whiteSpace: 'pre-line' }}
              >
                No categories specified
              </Typography>
            )}
            <Box mb={2}>
              {/* Here we render out a readonly list of categories for this event */}
              {userEvent?.categories.map((category, index) => (
                <Typography
                  fontSize={['0.8rem', '0.8rem', '1rem', '1.2rem', '1.4rem']}
                  color={theme.palette.primary.charcoal}
                  sx={{ whiteSpace: 'pre-line' }}
                  key={`${index}_${category}`}
                >
                  {CategoryDict[category]}
                </Typography>
              ))}
            </Box>
          </Box>
          {apiError && (
            <Box className='apiErrorsContainer' mb={2}>
              <Typography color='error'>{apiError}</Typography>
            </Box>
          )}
          <Box className='userActionsContainer' mb={3}>
            <Box
              sx={{
                display: 'block',
                [theme.breakpoints.up('md')]: {
                  display: 'flex',
                },
              }}
            >
              {status === AuthStatus.Authenticated && isSessionUserAttendingEvent() ? null : (
                <CommonButton
                  label='Attend'
                  textColor={theme.palette.primary.thirdColorIceLight}
                  borderColor={theme.palette.primary.lightIndigo}
                  backgroundColor={theme.palette.primary.lightIndigo}
                  borderRadius={'10px'}
                  baseButtonStyles={{
                    width: '100%',
                    fontSize: ['0.8rem', '0.8rem', '1rem', '1.2rem', '1.4rem'],
                  }}
                  onButtonClick={handleAttendButtonClicked}
                  disabled={isLoading}
                />
              )}
              {status === AuthStatus.Authenticated && isSessionUserAttendingEvent() && (
                <>
                  <Alert
                    icon={
                      <CheckIcon
                        fontSize='inherit'
                        sx={{
                          color: theme.palette.primary.thirdColorIceLight,
                          alignSelf: 'center',
                          fontWeight: 'heavy',
                        }}
                      />
                    }
                    severity='success'
                    sx={{
                      color: theme.palette.primary.thirdColorIceLight,
                      backgroundColor: theme.palette.primary.greenConfirmation,
                      fontWeight: 'bold',
                      fontSize: ['0.9rem', '1rem', '1.2rem', '1.3rem', '1.4rem'],
                      width: '100%',
                      marginBottom: '10px',
                      '&.MuiPaper-root': {
                        justifyContent: 'center',
                      },
                    }}
                  >
                    {getAttendEventButtonLabel(userEvent!)}
                  </Alert>

                  <CommonButton
                    label='Unregister from event'
                    variant='text'
                    textColor={theme.palette.primary.burntOrangeCancelError}
                    baseButtonStyles={{
                      width: '100%',
                      textDecoration: 'underline',
                      fontSize: ['0.8rem', '0.8rem', '1rem', '1.2rem', '1.4rem'],
                    }}
                    startIcon={<NotInterestedIcon />}
                    onButtonClick={handleUnregisterButtonClicked}
                    disabled={isLoading || (userEvent && isEventInPast(userEvent))}
                  />
                </>
              )}
              {status === AuthStatus.Authenticated && isSessionUserEventHost() && (
                <CommonButton
                  label='Delete this event'
                  variant='text'
                  textColor={theme.palette.primary.burntOrangeCancelError}
                  baseButtonStyles={{
                    width: '100%',
                    fontSize: ['0.8rem', '0.8rem', '1rem', '1.2rem', '1.4rem'],
                  }}
                  startIcon={<DeleteForever />}
                  onButtonClick={handleDeleteEventButtonClicked}
                  disabled={isLoading || (userEvent && isEventInPast(userEvent))}
                />
              )}
            </Box>
          </Box>
        </StyledContentContainer>
      </Suspense>
      <Suspense fallback={<Spinner />}>
        <StyledContentContainer
          p={'10%'}
          className='lowerContent'
          bgcolor={theme.palette.primary.backgroundColorLightPurple}
        >
          {/* Here is where the UserListContainer goes */}
          <UserListContainer
            title={'Attendees'}
            totalUserCount={userEvent?.participants.length || 0}
            previewUsers={eventParticipants}
          />
        </StyledContentContainer>
      </Suspense>
      <ConfirmationDialog
        open={confirmUnregisterDialogOpen}
        title='Unregister from event'
        prompt={`Do you want to continue to unregister from ${userEvent?.title || 'this event'}?`}
        options={[
          {
            title: 'Yes',
            action: () => {
              setConfirmUnregisterDialogOpen(false);
              completeUnregistrationAction();
            },
          },
          {
            title: 'Cancel',
            action: () => setConfirmUnregisterDialogOpen(false),
            color: 'error',
          },
        ]}
      />

      <EventEditor
        open={eventEditorModalOpen}
        eventContext={userEvent!}
        onClose={() => setEventEditModalOpen(false)}
        onUpdateActionTaken={handleEventUpdated}
        mapLoader={mapLoader}
      />

      <Snackbar
        open={eventUpdateSnackbarOpen}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
        message='Event was updated'
      />
    </Box>
  );
}

const getAttendEventButtonLabel = (ev: UserEvent): string => {
  return isEventInPast(ev) ? 'I went to this' : "I'm going";
};

// Separated out loading the image just to make the code more readable
const getEventImage = (setHasImageError: Dispatch<SetStateAction<boolean>>, imageUrl?: string) => {
  if (!imageUrl || imageUrl.trim() === '') return null;

  return (
    <Suspense fallback={<Spinner />}>
      <Box>
        <Image
          src={imageUrl || ''}
          alt='user-event-image'
          fill
          className={styles.userEventImage}
          onError={() => setHasImageError(true)}
        />
      </Box>
    </Suspense>
  );
};
const StyledContentContainer = styled(Box)(({ theme }) => ({}));

// This function will format dates to be more readable when they are on the same day so the end date just
// shows the time. When the start and end days are different, it will show the full date and time for both.
function formatDateRange(start: Date, end: Date, timezoneName?: string): string {
  if (!start || !end) return '';
  if (!timezoneName) {
    timezoneName = '(Unknown Timezone)';
  }
  const startDate = dayjs(start);
  const endDate = dayjs(end);
  if (startDate.isSame(endDate, 'day')) {
    return `${startDate.format('D MMM, YYYY HH:mm A')} to ${endDate.format('HH:mm A')} ${timezoneName}`;
  }
  return `${startDate.format('D MMM, YYYY HH:mm A')} to ${endDate.format('D MMM, YYYY HH:mm A')} ${timezoneName} `;
}
