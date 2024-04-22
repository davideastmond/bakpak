import { threadHasUnreadMessages } from './unread-message';

describe('unread-message', () => {
  it('should return true if the thread has unread messages', () => {
    // Arrange
    const threadContext = {
      messages: [
        {
          readStatus: {
            '1': true,
            '2': false,
          },
        },
      ],
    };
    const baseUserId = '2';
    // Act
    const result = threadHasUnreadMessages(threadContext as any, baseUserId);
    // Assert
    expect(result).toBe(true);
  });

  it('should return false if the thread has no unread messages', () => {
    // Arrange
    const threadContext = {
      messages: [
        {
          readStatus: {
            '1': true,
            '2': true,
          },
        },
      ],
    };
    const baseUserId = '2';
    // Act
    const result = threadHasUnreadMessages(threadContext as any, baseUserId);
    // Assert
    expect(result).toBe(false);
  });
});
