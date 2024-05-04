import { MessageClient } from './message-client';

describe('MessageClient tests', () => {
  describe('getAllThreadContexts', () => {
    test('should call the correct endpoint', async () => {
      // Arrange
      global.fetch = jest
        .fn()
        .mockImplementationOnce(() =>
          Promise.resolve({ ok: true, json: () => Promise.resolve([]) }),
        );

      // Act
      await MessageClient.getAllThreadContexts();

      // Assert
      expect(fetch).toHaveBeenCalledWith('/api/messages/threads');
    });
    test('should throw an error if the request is not successful', async () => {
      // Arrange
      global.fetch = jest
        .fn()
        .mockImplementationOnce(() =>
          Promise.resolve({ ok: false, json: () => Promise.resolve({}) }),
        );

      // Act && Assert
      await expect(MessageClient.getAllThreadContexts()).rejects.toThrow(
        'Error: Cannot fetch all thread contexts',
      );
    });
  });
  describe('createThreadAndPostMessage', () => {
    test('should throw an error if the request is not successful', async () => {
      // Arrange
      global.fetch = jest
        .fn()
        .mockImplementationOnce(() =>
          Promise.resolve({ ok: false, json: () => Promise.resolve({}) }),
        );

      // Act && Assert
      await expect(
        MessageClient.createThreadAndPostMessage({
          initiator: 'initiator',
          recipients: ['recipient'],
          message: 'message',
        }),
      ).rejects.toThrow('Error: Cannot create thread');
      fetchMock.mockRestore();
    });
  });
  test('called with correct arguments', async () => {
    // Arrange
    global.fetch = jest
      .fn()
      .mockImplementationOnce(() => Promise.resolve({ ok: true, json: () => Promise.resolve({}) }));

    // Act
    await MessageClient.createThreadAndPostMessage({
      initiator: 'initiator',
      recipients: ['recipient'],
      message: 'message',
    });

    // Assert
    expect(fetch).toHaveBeenCalledWith(
      '/api/messages/threads',
      expect.objectContaining({
        body: JSON.stringify({
          initiator: 'initiator',
          message: 'message',
          recipients: ['recipient'],
        }),
        headers: {
          'Content-Type': 'application/json',
        },
        method: 'POST',
      }),
    );
  });
  describe('patchDeleteRecipientFromThread', () => {
    test('should call the correct endpoint', async () => {
      // Arrange
      global.fetch = jest
        .fn()
        .mockImplementationOnce(() =>
          Promise.resolve({ ok: true, json: () => Promise.resolve({}) }),
        );

      // Act
      await MessageClient.patchDeleteRecipientFromThread('threadId');

      // Assert
      expect(fetch).toHaveBeenCalledWith('/api/messages/threads/threadId', {
        method: 'PATCH',
      });
    });
    test('should throw an error if the request is not successful', async () => {
      // Arrange
      global.fetch = jest
        .fn()
        .mockImplementationOnce(() =>
          Promise.resolve({ ok: false, json: () => Promise.resolve({}) }),
        );

      // Act && Assert
      await expect(MessageClient.patchDeleteRecipientFromThread('threadId')).rejects.toThrow(
        'Error: Cannot delete recipient from thread',
      );
    });
  });
  describe('postMessageToThread', () => {
    test('should call the correct endpoint', async () => {
      // Arrange
      global.fetch = jest
        .fn()
        .mockImplementationOnce(() =>
          Promise.resolve({ ok: true, json: () => Promise.resolve({}) }),
        );

      // Act
      await MessageClient.postMessageToThread({
        threadId: 'threadId',
        content: 'content',
      });

      // Assert
      expect(fetch).toHaveBeenCalledWith(
        '/api/messages/threads/threadId',
        expect.objectContaining({
          body: JSON.stringify({ content: 'content' }),
          headers: {
            'Content-Type': 'application/json',
          },
          method: 'PUT',
        }),
      );
    });
    test('should throw an error if the request is not successful', async () => {
      // Arrange
      global.fetch = jest
        .fn()
        .mockImplementationOnce(() =>
          Promise.resolve({ ok: false, json: () => Promise.resolve({}) }),
        );

      // Act && Assert
      await expect(
        MessageClient.postMessageToThread({
          threadId: 'threadId',
          content: 'content',
        }),
      ).rejects.toThrow('Error: Cannot post message');
    });
  });
  describe('patchMarkThreadAsRead', () => {
    test('should call the correct endpoint', async () => {
      // Arrange
      global.fetch = jest
        .fn()
        .mockImplementationOnce(() =>
          Promise.resolve({ ok: true, json: () => Promise.resolve({}) }),
        );

      // Act
      await MessageClient.patchMarkThreadAsRead('threadId');

      // Assert
      expect(fetch).toHaveBeenCalledWith('/api/messages/threads/threadId/read', {
        method: 'PATCH',
      });
    });
    test('should throw an error if the request is not successful', async () => {
      // Arrange
      global.fetch = jest
        .fn()
        .mockImplementationOnce(() =>
          Promise.resolve({ ok: false, json: () => Promise.resolve({}) }),
        );

      // Act && Assert
      await expect(MessageClient.patchMarkThreadAsRead('threadId')).rejects.toThrow(
        'Error: Cannot mark thread as read',
      );
    });
  });
});
