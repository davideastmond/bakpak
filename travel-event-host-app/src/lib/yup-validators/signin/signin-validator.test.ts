import { signInValidationSchema } from './signin-validator';

describe('signin-validator', () => {
  const data = {
    email: 'some@example.com',
    password1: 'top3$Breakfasts',
  };
  test('validation should pass', async () => {
    // Arrange

    // Act
    const result: any = await signInValidationSchema.validate(data);
    expect(result.errors).toBeUndefined();
    // Assert
  });
  test('validation should fail when email is missing', async () => {
    // Arrange
    const dataWithoutEmail = { ...data, email: '' };
    // Act

    try {
      await signInValidationSchema.validate(dataWithoutEmail);
    } catch (error: any) {
      // Assert
      expect(error.errors).toBeDefined();
      expect(error.errors.includes('Email is required')).toBeTruthy();
    }
  });
});
