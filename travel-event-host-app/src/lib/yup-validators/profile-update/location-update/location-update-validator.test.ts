import { locationUpdateValidationSchema } from './location-update-validator';

describe('location-update-validator', () => {
  const data = {
    country: 'USA',
    state: 'CA',
    city: 'San Francisco',
    place_id: 'ChIJIQBpAG2ahYAR_6128GcTUEo',
    formattedAddress: 'San Francisco, CA, USA',
    coords: {
      lat: 37.7749,
      lng: -122.4194,
    },
    timezone: {
      id: 'America/Los_Angeles',
      name: 'Pacific Standard Time',
    },
  };
  test('validation should pass', async () => {
    // Arrange
    // Act
    const result = await locationUpdateValidationSchema.isValid(data);
    // Assert
    expect(result).toBe(true);
  });
  test('validation should fail when country is missing', async () => {
    // Arrange
    const dataWithoutCountry = { ...data, country: '' };
    // Act
    try {
      await locationUpdateValidationSchema.validate(dataWithoutCountry);
    } catch (error: any) {
      // Assert
      expect(error.errors).toBeDefined();
      expect(error.errors.includes('country is a required field')).toBeTruthy();
    }
  });
  test('validation should fail when state is missing', async () => {
    // Arrange
    const dataWithoutState = { ...data, state: '' };
    // Act
    try {
      await locationUpdateValidationSchema.validate(dataWithoutState);
    } catch (error: any) {
      // Assert
      expect(error.errors).toBeDefined();
      expect(error.errors.includes('state is a required field')).toBeTruthy();
    }
  });
  test('validation should fail when city is missing', async () => {
    // Arrange
    const dataWithoutCity = { ...data, city: '' };
    // Act
    try {
      await locationUpdateValidationSchema.validate(dataWithoutCity);
    } catch (error: any) {
      // Assert
      expect(error.errors).toBeDefined();
      expect(error.errors.includes('city is a required field')).toBeTruthy();
    }
  });
  test('validation should fail when place_id is missing', async () => {
    // Arrange
    const dataWithoutPlaceId = { ...data, place_id: '' };
    // Act
    try {
      await locationUpdateValidationSchema.validate(dataWithoutPlaceId);
    } catch (error: any) {
      // Assert
      expect(error.errors).toBeDefined();
      expect(error.errors.includes('place_id is a required field')).toBeTruthy();
    }
  });
});
