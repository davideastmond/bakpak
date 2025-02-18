'use client';
import styles from './styles.module.css';

import { EventClient } from '@/app/clients/event/event-client';

import { UserEvent } from '@/models/user-event';
import { Box, Button, MenuItem, Select } from '@mui/material';
import { useRouter } from 'next/navigation';
import { Suspense, useEffect, useState } from 'react';
import { EventCard } from '../event/event-card/Event-card';

import { IAppActionType, useAppContext } from '@/lib/app-context';
import { Category } from '@/lib/category';
import {
  generateInitialCheckboxState,
  loadCheckboxStateFromLocalStorage,
} from '../checkbox-group/utils/generate-initial-checkbox-state';
import { getCheckedElements } from '../checkbox-group/utils/get-checked-elements';
import { Spinner } from '../spinner/Spinner';
import { EventSearchFilterBox } from './event-search-filter-box/EventSearchFilterBox';
import { SearchInputField } from './search-input-field/SearchInputField';

interface EventSearchSectionProps {
  keyword: string;
}

export function EventSearchSection({ keyword }: EventSearchSectionProps) {
  const [sortBy, setSortBy] = useState<string>('Date');
  const [resultEventList, setResultEventList] = useState<UserEvent[]>([]);
  const [categoryCheckboxState, setCategoryCheckboxState] = useState<{ [key in string]: boolean }>(
    loadCheckboxStateFromLocalStorage() || generateInitialCheckboxState(Category),
  );
  const [isFilterBoxOpen, setIsFilterBoxOpen] = useState<boolean>(false);
  const router = useRouter();
  const { appDispatch } = useAppContext();
  const handleSearch = (searchInput: string) => {
    const url = `/events/search/${searchInput}`; // Construct the URL
    localStorage.setItem('categoryCheckboxState', JSON.stringify(categoryCheckboxState));
    router.push(url); // Navigate to the URL
  };

  useEffect(() => {
    const executeEventSearch = async () => {
      const eventsResultFetch = await EventClient.getEventsBySearchQuery({
        keyword,
        categories: getCheckedElements(categoryCheckboxState),
      });
      setResultEventList(eventsResultFetch);
    };
    executeEventSearch();
  }, [categoryCheckboxState, keyword]);

  useEffect(() => {
    appDispatch!({ type: IAppActionType.SET_IDLE });
  }, []);

  return (
    <section className={styles.section}>
      <div
        onClick={() => setIsFilterBoxOpen(false)}
        className={`${styles.overlay} ${isFilterBoxOpen ? styles.open : ''}`}
      ></div>

      <EventSearchFilterBox
        filterBoxIsOpen={isFilterBoxOpen}
        setCategories={setCategoryCheckboxState}
        categories={categoryCheckboxState}
        setFilterBoxIsOpen={setIsFilterBoxOpen}
      />
      <Box sx={{ display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
        <Box sx={{ width: '100%', display: 'flex', flexDirection: 'row', gap: '2em' }}>
          <SearchInputField handleSearch={handleSearch} keyword={keyword} />
          <Select
            sx={{
              backgroundColor: 'white',
              minWidth: '8em',
              height: 'min-content',
            }}
            value={sortBy}
            onChange={(event) => setSortBy(event.target.value as string)}
          >
            <MenuItem value='Relevance'>Revelance</MenuItem>
            <MenuItem value='Date'>Date</MenuItem>
          </Select>
        </Box>
        <Button className={styles.filterBtn} onClick={() => setIsFilterBoxOpen(true)}>
          Show Filters
        </Button>
        <Suspense fallback={<Spinner />}>
          <ul className={styles.eventsGrid}>
            {resultEventList.length > 0 ? (
              resultEventList.map((event) => (
                <li key={event._id}>
                  <EventCard
                    hostedEvent={event}
                    onCardClick={() => router.push(`/events/${event._id}`)}
                  />
                </li>
              ))
            ) : (
              <p className={styles.eventNotFound}>No results</p>
            )}
          </ul>
        </Suspense>
      </Box>
    </section>
  );
}
