import { CoordsHelper } from './coords-helper';

describe('coords-helper', () => {
  describe('toFloat', () => {
    it('should convert MongoNumberDecimal to number', () => {
      // Arrange
      const value = { $numberDecimal: '123.456' };
      // Act
      const result = CoordsHelper.toFloat(value);
      // Assert
      expect(result).toBe(123.456);
    });
  });
});
