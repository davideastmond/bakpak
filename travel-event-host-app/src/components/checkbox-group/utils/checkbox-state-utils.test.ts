import {
  generateInitialCheckboxState,
  generateInitialCheckboxStateFromArray,
  loadCheckboxStateFromLocalStorage,
} from './checkbox-state-utils';

describe('checkbox-state-utils', () => {
  describe('generateInitialCheckboxState', () => {
    it('should return an object with all values set to false', () => {
      // Arrange
      const fromObject = {
        key1: 'value1',
        key2: 'value2',
      };
      // Act
      const result = generateInitialCheckboxState(fromObject);
      // Assert
      expect(result).toEqual({
        value1: false,
        value2: false,
      });
    });
  });
  describe('loadCheckboxStateFromLocalStorage', () => {
    it('should return null if there is no state in local storage', () => {
      // Arrange
      localStorage.clear();
      // Act
      const result = loadCheckboxStateFromLocalStorage();
      // Assert
      expect(result).toBeNull();
    });
    it('should return the state from local storage', () => {
      // Arrange
      localStorage.setItem(
        'categoryCheckboxState',
        JSON.stringify({ value1: true, value2: false }),
      );
      // Act
      const result = loadCheckboxStateFromLocalStorage();
      // Assert
      expect(result).toEqual({ value1: true, value2: false });
    });
  });
  describe('generateInitialCheckboxStateFromArray', () => {
    it('should return an object with the specified elements set to true', () => {
      // Arrange
      const elements = ['value1'];
      const fromObject = {
        key1: 'value1',
        key2: 'value2',
      };
      // Act
      const result = generateInitialCheckboxStateFromArray(elements, fromObject);
      // Assert
      expect(result).toEqual({
        value1: true,
        value2: false,
      });
    });
  });
});
