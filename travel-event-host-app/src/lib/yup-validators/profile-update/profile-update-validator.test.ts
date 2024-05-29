import { profileUpdateValidationSchema } from './profile-update-validator';

const sampleData = {
  firstName: 'John',
  lastName: 'Doe',
  bio: 'This is a bio',
  imageUrl: 'https://example.com/image.jpg',
  deleteImageUrl: undefined,
};

describe('profileUpdateValidationSchema', () => {
  test('it object should pass validation', () => {
    expect(profileUpdateValidationSchema.isValidSync(sampleData)).toBe(true);
  });
  describe('firstName', () => {
    test.each([
      ['J', false],
      ['J'.repeat(51), false],
      [undefined, false],
    ])('it should fail validation if firstName is %s', (firstName, expected) => {
      expect(
        profileUpdateValidationSchema.isValidSync({
          ...sampleData,
          firstName,
        }),
      ).toBe(expected);
    });
  });
  describe('lastName', () => {
    test.each([
      ['J', false],
      ['J'.repeat(51), false],
    ])('it should fail validation if lastName is %s', (lastName, expected) => {
      expect(
        profileUpdateValidationSchema.isValidSync({
          ...sampleData,
          lastName,
        }),
      ).toBe(expected);
    });
  });
  describe('bio', () => {
    test('it should fail validation if bio is too long', () => {
      expect(
        profileUpdateValidationSchema.isValidSync({
          ...sampleData,
          bio: 'B'.repeat(256),
        }),
      ).toBe(false);
    });
  });
  describe('imageUrl', () => {
    test.each([
      ['https://example.com/image.jpg', true],
      ['not-aurl', false],
      [undefined, true],
    ])(`it should pass validation if imageUrl is %s`, (imageUrl, expected) => {
      expect(
        profileUpdateValidationSchema.isValidSync({
          ...sampleData,
          imageUrl,
        }),
      ).toBe(expected);
    });
  });
  describe('deleteImageUrl', () => {
    test('it should pass validation if deleteImageUrl is undefined', () => {
      expect(
        profileUpdateValidationSchema.isValidSync({
          ...sampleData,
          deleteImageUrl: undefined,
        }),
      ).toBe(true);
    });
  });
});
