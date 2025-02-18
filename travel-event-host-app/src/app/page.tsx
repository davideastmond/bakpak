'use client';
import { CategoriesSection } from '@/components/categories-section/CategoriesSection';
import { CreateEventSection } from '@/components/create-event-section/Create-event-section';
import { EventsSection } from '@/components/events-section/Events-section';
import { HeroSection } from '@/components/hero/Hero-Section';
import { Spinner } from '@/components/spinner/Spinner';
import { IAppActionType, useAppContext } from '@/lib/app-context';
import { useAuthContext } from '@/lib/auth-context';
import { AuthStatus } from '@/lib/auth-status';
import { UserEvent } from '@/models/user-event';
import { EventTimeLine } from '@/types/event-timeline';
import { Backdrop, Box } from '@mui/material';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { EventClient } from './clients/event/event-client';

export default function Home() {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [userEvents, setUserEvents] = useState<UserEvent[]>([]);
  const [pageNumber, setPageNumber] = useState<number>(1);

  const { status } = useAuthContext();
  const { appDispatch } = useAppContext();
  const router = useRouter();

  useEffect(() => {
    fetchUserEvents();
  }, [pageNumber]); // loading of user events on the home page

  useEffect(() => {
    appDispatch!({ type: IAppActionType.SET_IDLE });
  }, []);

  const fetchUserEvents = async () => {
    setIsLoading(true);
    // Fetch events
    try {
      const reponse = await EventClient.getAllEvents(EventTimeLine.Upcoming, pageNumber, 4);
      setUserEvents([...userEvents, ...reponse.events]);
      setIsLoading(false);
    } catch (error: any) {
      console.error(error);
      setIsLoading(false);
    }
  };

  const handleCreateEventButtonClicked = async () => {
    // If the user is authenticated, redirect to the create event page
    // otherwise, redirect to the login page
    appDispatch!({ type: IAppActionType.SET_LOADING });
    if (status === AuthStatus.Authenticated) {
      router.push('/events/create');
      return;
    }

    router.push('/auth/signin');
  };
  const handleEventCardClicked = (eventId: string) => {
    setIsLoading(true);
    router.push(`/events/${eventId}`);
  };

  return (
    <Box>
      <Backdrop open={isLoading}>
        <Spinner />
      </Backdrop>
      <Box id='enclosure' marginLeft={[0, 0, '10%', '20%']} marginRight={[0, 0, '10%', '20%']}>
        <HeroSection />
        <Box mb={5} mt={5}>
          <EventsSection
            title='Upcoming Events'
            hostedEvents={userEvents}
            onLoadMoreEventsButtonClicked={() => setPageNumber(pageNumber + 1)}
            isLoading={isLoading}
            onEventCardClicked={handleEventCardClicked}
          />
        </Box>
        <Box mb={5}>
          <CategoriesSection />
        </Box>
        <Box>
          <CreateEventSection onCreateEventButtonClick={handleCreateEventButtonClicked} />
        </Box>
      </Box>
    </Box>
  );
}
