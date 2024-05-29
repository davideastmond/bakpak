import { userScopesValidator } from './user-scopes-validator';

describe('user-scopes-validator', () => {
  test('validation should pass', async () => {
    // Arrange
    const scopes = ['firstName', 'lastName', 'imageUrl', 'email', 'bio', 'location', 'isAdmin'];
    // Act
    const result = await userScopesValidator.isValid(scopes);
    // Assert
    expect(result).toBe(true);
  });
  test('validation should fail', async () => {
    // Arrange
    const scopes = [
      'firstName',
      'lastName',
      'imageUrl',
      'email',
      'bio',
      'location',
      'isAdmin',
      'invalid',
    ];
    // Act
    const result = await userScopesValidator.isValid(scopes);
    // Assert
    expect(result).toBe(false);
  });
  test('validation should pass when scopes is undefined', async () => {
    // Arrange
    const scopes = undefined;
    // Act
    const result = await userScopesValidator.isValid(scopes);
    // Assert
    expect(result).toBe(true);
  });
});
