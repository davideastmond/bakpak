// Upcoming events page
'use client';
import { EventClient } from '@/app/clients/event/event-client';
import { EventsSection } from '@/components/events-section/Events-section';
import { IAppActionType, useAppContext } from '@/lib/app-context';
import { Category } from '@/lib/category';
import { CategoryDict } from '@/lib/category-dictionary';
import { UserEvent } from '@/models/user-event';
import { EventTimeLine } from '@/types/event-timeline';
import { Backdrop, Box } from '@mui/material';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';

// This page can be a place for all upcoming events to be displayed
// or it can be a place to show events by category (search param)
// /events/upcoming?category=xxx
export default function UpcomingEventsPage() {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [upcomingEvents, setUpcomingEvents] = useState<UserEvent[]>([]);
  const [pageNumber, setPageNumber] = useState<number>(1);
  const [title, setTitle] = useState<string>('Upcoming events');
  const { appDispatch } = useAppContext();
  useEffect(() => {
    fetchUpcomingUserEvents();
  }, [pageNumber]);

  useEffect(() => {
    appDispatch!({ type: IAppActionType.SET_IDLE });
  }, []);

  const searchParams = useSearchParams();
  const router = useRouter();

  const fetchUpcomingUserEvents = async () => {
    const category = searchParams.get('category');
    try {
      setIsLoading(true);
      if (category === null || category === 'all') {
        setTitle('Upcoming events');
        const fetchedUpcomingEvents = await EventClient.getAllEvents(
          EventTimeLine.Upcoming,
          pageNumber,
          4,
        );

        setUpcomingEvents([...upcomingEvents, ...fetchedUpcomingEvents.events]);
        return;
      }
      setTitle(`Upcoming ${CategoryDict[category as Category]} events`);
      const fetchedUpcomingEvents = await EventClient.getEventsBySearchQuery({
        categories: [category as Category],
        page: pageNumber,
        pageSize: 4,
      });
      setUpcomingEvents([...upcomingEvents, ...fetchedUpcomingEvents]);
      return;
    } catch (error: any) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEventCardClicked = (eventId: string) => {
    setIsLoading(true);
    router.push(`/events/${eventId}`);
  };

  return (
    <Box padding='5%'>
      <Backdrop open={isLoading} />
      <EventsSection
        title={title}
        hostedEvents={upcomingEvents}
        onLoadMoreEventsButtonClicked={() => setPageNumber(pageNumber + 1)}
        isLoading={isLoading}
        onEventCardClicked={handleEventCardClicked}
      />
    </Box>
  );
}
