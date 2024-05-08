import { createNewMessageValidator, postMessageToThreadValidator } from './messages-validator';

describe('messageValidator tests', () => {
  describe('createNewMessageValidator tests', () => {
    it('should validate the initiator field', () => {
      // Arrange
      const data = { initiator: '', recipients: [''], message: '' };
      // Act
      const result = createNewMessageValidator.isValidSync(data);
      // Assert
      expect(result).toBe(false);
    });

    it('should validate as true the recipients field when empty array', () => {
      // Arrange
      const data = { initiator: 'initiator', recipients: [], message: 'message' };
      // Act
      const result = createNewMessageValidator.isValidSync(data);
      // Assert
      expect(result).toBe(true);
    });

    it('should validate as false when the recipients field is undefined', () => {
      // Arrange
      const data = { initiator: 'initiator', recipients: undefined, message: 'message' };
      // Act
      const result = createNewMessageValidator.isValidSync(data);
      // Assert
      expect(result).toBe(false);
    });

    it('should validate the recipients field empty field', () => {
      // Arrange
      const data = { initiator: 'initiator', recipients: ['1234'], message: 'message' };
      // Act
      const result = createNewMessageValidator.isValidSync(data);
      // Assert
      expect(result).toBe(true);
    });

    it('should validate the message field', () => {
      // Arrange
      const data = { initiator: 'initiator', recipients: ['recipient'], message: '' };
      // Act
      const result = createNewMessageValidator.isValidSync(data);
      // Assert
      expect(result).toBe(false);
    });

    it('should return true when all fields are valid', () => {
      // Arrange
      const data = { initiator: 'initiator', recipients: ['recipient'], message: 'message' };
      // Act
      const result = createNewMessageValidator.isValidSync(data);
      // Assert
      expect(result).toBe(true);
    });
  });
  describe('postMessageToThreadValidator tests', () => {
    it('should validate the content field as false where there is empty string', () => {
      // Arrange
      const data = { content: '' };
      // Act
      const result = postMessageToThreadValidator.isValidSync(data);
      // Assert
      expect(result).toBe(false);
    });

    it('should return true when the content field is valid', () => {
      // Arrange
      const data = { content: 'content' };
      // Act
      const result = postMessageToThreadValidator.isValidSync(data);
      // Assert
      expect(result).toBe(true);
    });
  });
});
