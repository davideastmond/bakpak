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
}
