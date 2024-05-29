import { extractValidationErrors } from './extract-validation-errors';

describe('extract-validation-errors', () => {
  it('should return an empty object when there are no errors', () => {
    // Arrange
    const errors = {
      inner: [],
    };
    // Act
    const result = extractValidationErrors(errors);
    // Assert
    expect(result).toEqual({});
  });

  it('should return an object with validation errors', () => {
    // Arrange
    const errors = {
      inner: [
        {
          path: 'email',
          message: 'Email is required',
        },
        {
          path: 'password',
          message: 'Password is required',
        },
      ],
    };
    // Act
    const result = extractValidationErrors(errors);
    // Assert
    expect(result).toEqual({
      email: ['Email is required'],
      password: ['Password is required'],
    });
  });

  it('should group multiple errors for the same field', () => {
    // Arrange
    const errors = {
      inner: [
        {
          path: 'email',
          message: 'Email is required',
        },
        {
          path: 'email',
          message: 'Email is invalid',
        },
      ],
    };
    // Act
    const result = extractValidationErrors(errors);
    // Assert
    expect(result).toEqual({
      email: ['Email is required', 'Email is invalid'],
    });
  });
});
