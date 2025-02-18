'use client';
import { EventClient } from '@/app/clients/event/event-client';
import { UserClient } from '@/app/clients/user/user-client';
import { getLocationPostDataFromGeocoderResult } from '@/app/integration/google-maps-api/address-helper';
import { GoogleMapsTimezoneData } from '@/app/integration/google-maps-api/timezone-requestor';
import theme from '@/app/theme';
import { CommonButton } from '@/components/common-button/Common-Button';
import { EventsSection } from '@/components/events-section/Events-section';
import { ProfileEditor } from '@/components/profile-editor/ProfileEditor';
import { Spinner } from '@/components/spinner/Spinner';
import { IAppActionType, useAppContext } from '@/lib/app-context';
import { useAuthContext } from '@/lib/auth-context';
import { AuthStatus } from '@/lib/auth-status';
import { isValidMongoId } from '@/lib/utils/mongo-id-validation';
import { UserEvent } from '@/models/user-event';
import { EventTimeLine } from '@/types/event-timeline';
import { SecureUser } from '@/types/secure-user';
import { Alert, Backdrop, Box } from '@mui/material';
import { useRouter } from 'next/navigation';
import { Suspense, useEffect, useState } from 'react';

interface UserPortalPageProps {
  params: {
    id: string;
  };
}

export default function UserPortalPage({ params: { id } }: UserPortalPageProps) {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [user, setUser] = useState<SecureUser | undefined>(undefined);

  const [upcomingEvents, setUpcomingEvents] = useState<UserEvent[]>([]);
  const [hostedEvents, setHostedEvents] = useState<UserEvent[]>([]);
  const [pastEvents, setPastEvents] = useState<UserEvent[]>([]);

  const [error, setError] = useState<string | undefined>(undefined);
  const { status, session, update } = useAuthContext();

  const [hostedEventsPageNumber, setHostedEventsPageNumber] = useState<number>(1);
  const [upcomingEventsPageNumber, setUpcomingEventsPageNumber] = useState<number>(1);
  const [pastEventsPageNumber, setPastEventsPageNumber] = useState<number>(1);
  const router = useRouter();
  const { appDispatch } = useAppContext();

  useEffect(() => {
    fetchUser();
    fetchUserUpcomingEvents();
    fetchUserHostedEvents();
    fetchUserPastEvents();
    appDispatch!({ type: IAppActionType.SET_IDLE });
  }, []);

  useEffect(() => {
    fetchUserHostedEvents();
  }, [hostedEventsPageNumber]);

  useEffect(() => {
    fetchUserUpcomingEvents();
  }, [upcomingEventsPageNumber]);

  useEffect(() => {
    fetchUserPastEvents();
  }, [pastEventsPageNumber]);

  const fetchUser = async (showLoading: boolean = true) => {
    if (!isValidMongoId(id)) {
      router.push('/');
    }
    try {
      showLoading && setIsLoading(true);
      const fetchedUser = await UserClient.getUserById(id);
      setUser(fetchedUser);
      showLoading && setIsLoading(false);
    } catch (e: any) {
      setError(e.message);
    }
  };

  const fetchUserHostedEvents = async () => {
    try {
      const fetchedHostedEvents = await EventClient.getEventsBySearchQuery({
        eventCreatorId: id,
        timeline: EventTimeLine.Upcoming,
        page: hostedEventsPageNumber,
        pageSize: 3,
      });
      setHostedEvents([...hostedEvents, ...fetchedHostedEvents!]);
    } catch (e: any) {
      setError(e.message);
    }
  };

  const fetchUserUpcomingEvents = async () => {
    try {
      const fetchedUpcomingEvents = await EventClient.getEventsByUserId(
        id,
        EventTimeLine.Upcoming,
        upcomingEventsPageNumber,
        3,
      );
      setUpcomingEvents([...upcomingEvents, ...fetchedUpcomingEvents!]);
    } catch (e: any) {
      setError(e.message);
    }
  };

  const fetchUserPastEvents = async () => {
    try {
      const fetchedPastEvents = await EventClient.getEventsByUserId(
        id,
        EventTimeLine.Past,
        pastEventsPageNumber,
        3,
      );
      setPastEvents([...pastEvents, ...fetchedPastEvents!]);
    } catch (e: any) {
      setError(e.message);
    }
  };

  const handleProfileUpdate = async (
    formValues: Record<string, string | null | undefined>,
    deleteImageUrl?: boolean,
  ) => {
    // Send patch request to update the user's profile
    if (status !== AuthStatus.Authenticated) return;
    try {
      const { firstName, lastName, bio, imageUrl } = formValues;

      await UserClient.patchUserProfileById(session?.user?._id!, {
        firstName: firstName!,
        lastName: lastName!,
        bio: bio!,
        imageUrl: imageUrl!,
        deleteImageUrl,
      });
      await fetchUser(false);
      // Update the session
      if (update) {
        await update();
      }
    } catch (e: any) {
      setError(e.message);
    }
  };

  const handleUserLocationUpdate = async (
    location: google.maps.places.PlaceResult | null,
    timezoneData: GoogleMapsTimezoneData,
  ) => {
    if (!location) return;
    if (status !== AuthStatus.Authenticated) return;

    // TODO: timezone
    let locationData: any = getLocationPostDataFromGeocoderResult(
      location as google.maps.GeocoderResult,
    );
    locationData = {
      ...locationData,
      timezone: {
        id: timezoneData.timeZoneId,
        name: timezoneData.timeZoneName,
      },
    };
    try {
      await UserClient.patchUserLocationById(session?.user?._id!, locationData);
      // Refresh the user
      await fetchUser(false);
      if (update) await update();
    } catch (e: any) {
      setError(e.message);
    }
  };

  const handleEventCardClicked = (eventId: string) => {
    router.push(`/events/${eventId}`);
  };

  return (
    <Box>
      <Backdrop open={isLoading}>
        <Spinner />
      </Backdrop>
      {error && <Alert severity='error'>{error}</Alert>}
      <Box
        className={'userProfileHeaderSection'}
        pt={3}
        pb={4}
        bgcolor={theme.palette.primary.lightIndigo}
        sx={{
          border: '1px solid black',
        }}
      >
        <Box display='flex' justifyContent={'center'}>
          {isLoading ? (
            <Spinner />
          ) : (
            <ProfileEditor
              user={user}
              editDisabled={session?.user?._id !== id}
              isLoading={isLoading}
              onProfileUpdate={handleProfileUpdate}
              onLocationUpdate={handleUserLocationUpdate}
            />
          )}
        </Box>
        {session?.user?._id !== id && (
          <Suspense fallback={<Spinner />}>
            <Box mt={3} display='flex' justifyContent={'center'} ml={2}>
              {/* Hot pink chat button */}
              <CommonButton
                onButtonClick={() => router.push(`/messages?target=${id}&newMessage=true`)}
                label={`Chat with ${user?.firstName}`}
                backgroundColor={theme.palette.primary.sexyHotPink}
                borderColor={theme.palette.primary.sexyHotPink}
                textColor={theme.palette.primary.thirdColorIceLight}
                borderRadius={2}
              />
            </Box>
          </Suspense>
        )}
      </Box>
      <Box
        mt={3}
        sx={{
          [theme.breakpoints.up(600)]: {
            marginLeft: 4,
          },
          [theme.breakpoints.up(960)]: {
            marginLeft: 6,
          },
        }}
      >
        {/* Hosted events can be public? The upcoming and past events are for user's eyes only*/}
        {hostedEvents && hostedEvents.length > 0 && (
          <Box mb={2}>
            <EventsSection
              title="Events I'm hosting"
              hostedEvents={hostedEvents}
              onLoadMoreEventsButtonClicked={() =>
                setHostedEventsPageNumber(hostedEventsPageNumber + 1)
              }
              isLoading={isLoading}
              onEventCardClicked={handleEventCardClicked}
            />
          </Box>
        )}
        {status === AuthStatus.Authenticated && session?.user?._id === id && (
          <Box>
            <EventsSection
              title='Upcoming events'
              hostedEvents={upcomingEvents}
              onLoadMoreEventsButtonClicked={() =>
                setUpcomingEventsPageNumber(upcomingEventsPageNumber + 1)
              }
              isLoading={isLoading}
              onEventCardClicked={handleEventCardClicked}
            />
          </Box>
        )}
        {status === AuthStatus.Authenticated && session?.user?._id === id && (
          <Box mt={3} mb={5}>
            <EventsSection
              title='Past events'
              hostedEvents={pastEvents}
              onLoadMoreEventsButtonClicked={() =>
                setPastEventsPageNumber(pastEventsPageNumber + 1)
              }
              isLoading={isLoading}
              onEventCardClicked={handleEventCardClicked}
            />
          </Box>
        )}
      </Box>
    </Box>
  );
}
