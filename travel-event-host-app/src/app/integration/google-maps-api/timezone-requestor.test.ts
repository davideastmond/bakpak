import { TimezoneRequestor } from './timezone-requestor';

describe('Google Maps API Timezone Requestor', () => {
  test('called with the correct url parameters', async () => {
    fetchMock.mockResolvedValueOnce({ json: () => Promise.resolve() } as any);

    const coords = { lat: 1, lng: 2 };
    const timestamp = 1234567890;
    const expectedUrl = `https://maps.googleapis.com/maps/api/timezone/json?location=1%2C2&timestamp=${timestamp}&key=${process.env.NEXT_PUBLIC_GOOGLE_API_KEY}`;

    await TimezoneRequestor.getTimezoneByCoords(coords, timestamp);

    expect(fetchMock).toHaveBeenCalledWith(expectedUrl);
  });
});
