import { GoogleMapsTimezoneData } from '@/app/integration/google-maps-api/timezone-requestor';
import dayjs from 'dayjs';

export interface EventUpdateData {
  title: string;
  description: string;
  startDate: dayjs.Dayjs;
  endDate: dayjs.Dayjs;
  imageUrl: string;
  geocoderResult: google.maps.places.PlaceResult;
  categories: string[];
  imageFile: File;
  timezoneResult: GoogleMapsTimezoneData;
}
