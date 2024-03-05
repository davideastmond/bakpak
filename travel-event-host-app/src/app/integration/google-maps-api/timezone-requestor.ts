export interface GoogleMapsTimezoneData {
  status: 'OK' | string;
  dstOffset?: number;
  errorMessage?: string;
  rawOffset?: number;
  timeZoneId?: string;
  timeZoneName?: string;
}

export const TimezoneRequestor = {
  async getTimezoneByCoords(
    coords: google.maps.LatLngLiteral,
    timestamp: number,
  ): Promise<GoogleMapsTimezoneData> {
    const googleTimezoneApiUrl = new URL('https://maps.googleapis.com/maps/api/timezone/json');
    googleTimezoneApiUrl.searchParams.append('location', `${coords.lat},${coords.lng}`);
    googleTimezoneApiUrl.searchParams.append('timestamp', timestamp.toString());
    googleTimezoneApiUrl.searchParams.append('key', process.env.NEXT_PUBLIC_GOOGLE_API_KEY!);

    const data = await fetch(googleTimezoneApiUrl.toString());
    const response = await data.json();
    return response as GoogleMapsTimezoneData;
  },
};
