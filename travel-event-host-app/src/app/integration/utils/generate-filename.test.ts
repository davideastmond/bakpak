import { generateFilename } from './generate-filename';

describe('generateFilename', () => {
  test('generates filename with id and random mongo id', () => {
    // Arrange
    const id = '123';

    // Act
    const result = generateFilename(id);

    // Assert
    expect(result).toMatch(/123-[0-9a-f]{24}/);
  });
});
