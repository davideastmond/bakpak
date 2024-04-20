import {
  getLocationPostDataFromGeocoderResult,
  getTimezoneDataFromTimezoneResult,
} from './address-helper';

describe('AddressHelper', () => {
  test('extracts data correctly', () => {
    const mockGeocoderMapsResult = {
      geometry: {
        location: {
          lat: () => 1,
          lng: () => 1,
        },
      },
      place_id: 'mockPlaceId',
      formatted_address: '123 Fake St.',
      address_components: [
        {
          types: ['mockType', 'country'],
          place_id: 'mockplaceid',
          geometry: undefined,
          long_name: 'Canada',
        },
        { types: ['mockType'], long_name: 'mockLongName', short_name: 'mockShortName' },
        {
          types: ['administrative_area_level_1'],
          long_name: 'mockLongNameState',
          short_name: 'mockShortNameState',
        },
        {
          types: ['locality'],
          long_name: 'mockLongName',
          short_name: 'mockShortName',
        },
      ],
    };

    const result = getLocationPostDataFromGeocoderResult(mockGeocoderMapsResult as any);
    expect(result).toEqual({
      country: 'Canada',
      state: 'mockLongNameState',
      city: 'Canada',
      formattedAddress: '123 Fake St.',
      coords: { lat: 1, lng: 1 },
      place_id: 'mockPlaceId',
    });
  });
  test('test poliical address', () => {
    const mockGeocoderMapsResult = {
      geometry: {
        location: {
          lat: () => 1,
          lng: () => 1,
        },
      },
      place_id: 'mockPlaceId',
      formatted_address: '123 Fake St.',
      address_components: [
        {
          types: ['political'],
          long_name: 'mockLongNamePolitical',
          short_name: 'mockShortNamePolitical',
        },
      ],
    };

    const result = getLocationPostDataFromGeocoderResult(mockGeocoderMapsResult as any);
    expect(result).toHaveProperty('city', 'mockLongNamePolitical');
  });
  describe('Timezone data extraction', () => {
    test('extracts timezone data correctly', () => {
      const mockTimezoneData = {
        timeZoneId: 'mockTimeZoneId',
        timeZoneName: 'mockTimeZoneName',
      };

      const result = getTimezoneDataFromTimezoneResult(mockTimezoneData as any);
      expect(result).toEqual({
        id: 'mockTimeZoneId',
        name: 'mockTimeZoneName',
      });
    });
  });
});
