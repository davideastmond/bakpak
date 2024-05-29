import { getCheckedElements } from './get-checked-elements';

describe('getCheckedElements', () => {
  it('should return an array with the checked elements', () => {
    // Arrange
    const checkboxState = {
      value1: true,
      value2: false,
    };
    // Act
    const result = getCheckedElements(checkboxState);
    // Assert
    expect(result).toEqual(['value1']);
  });
  it('should return an empty array if there are no checked elements', () => {
    // Arrange
    const checkboxState = {
      value1: false,
      value2: false,
    };
    // Act
    const result = getCheckedElements(checkboxState);
    // Assert
    expect(result).toEqual([]);
  });
});
