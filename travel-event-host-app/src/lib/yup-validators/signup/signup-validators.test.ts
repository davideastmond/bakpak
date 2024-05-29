import { signUpValidationSchema } from './signup-validators';

const baseSignup = {
  email: 'example@example.com',
  password1: 'tIpia!tuuy3',
  password2: 'tIpia!tuuy3',
  firstName: 'John',
  lastName: 'Doe',
  location: {
    address_components: [],
    formatted_address: '123 Main St',
    geometry: {},
    place_id: '123',
  },
};
describe('signUpValidationSchema', () => {
  test('all attributes pass validation', () => {
    expect(signUpValidationSchema.isValidSync(baseSignup)).toBe(true);
  });
  describe('email', () => {
    test.each([
      [undefined, 'Email is required'],
      ['example', 'Email is invalid'],
    ])('%p should return %p', (email, expected) => {
      expect(signUpValidationSchema.isValidSync({ ...baseSignup, email })).toBe(false);
      expect(() => signUpValidationSchema.validateSync({ ...baseSignup, email })).toThrow(expected);
    });
  });
  describe('password1', () => {
    test.each([
      [undefined, 'This field is required', false],
      [
        't',
        'Password must be at least 8 characters, contain letters and numbers and at least one of these symbols [@#$%!]',
        false,
      ],
    ])('%p should return %p', (password1, message, expected) => {
      expect(signUpValidationSchema.isValidSync({ ...baseSignup, password1 })).toBe(expected);
    });
  });
  describe('password2', () => {
    test.each([
      [undefined, 'Y$555555', 'This field is required', false],
      ['Y$555556', 'Y$555555', 'Passwords must match', false],
    ])('%p should return $p', (password2, password1, message, expected) => {
      expect(signUpValidationSchema.isValidSync({ ...baseSignup, password1, password2 })).toBe(
        expected,
      );
    });
  });
  describe('firstName and lastName', () => {
    test.each([
      ['J', 'firstName', 'First name must be at least 2 characters', false],
      ['J'.repeat(51), 'firstName', 'First name must be at most 50 characters', false],
      ['J', 'lastName', 'Last name must be at least 2 characters', false],
      ['J'.repeat(51), 'lastName', 'Last name must be at most 50 characters', false],
    ])('%p should return %p', (value, key, message, expected) => {
      expect(signUpValidationSchema.isValidSync({ ...baseSignup, [key]: value })).toBe(expected);
    });
  });
  describe('location', () => {
    test('it should fail validation if location is missing', () => {
      expect(signUpValidationSchema.isValidSync({ ...baseSignup, location: undefined })).toBe(
        false,
      );
    });
    test('it should display validation messages', () => {
      try {
        signUpValidationSchema.validateSync(
          { ...baseSignup, location: undefined },
          { abortEarly: false },
        );
      } catch (e: any) {
        expect(e.errors).toBeDefined();
        expect(e.errors).toEqual([
          'Address components missing',
          'Formatted address missing',
          'geoloc information missing',
          'place id missing',
        ]);
      }
    });
  });
});
