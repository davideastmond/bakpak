import { UserClient } from './user-client';

describe('UserClient', () => {
  describe('getUserById', () => {
    it('should fetch user by id', async () => {
      // Arrange
      const userId = '123';
      const scopes = ['scope1', 'scope2'];
      const response = { json: jest.fn() };
      const fetch = jest.fn().mockResolvedValue(response);
      global.fetch = fetch;

      // Act
      await UserClient.getUserById(userId, scopes);

      // Assert
      expect(fetch).toHaveBeenCalledWith('/api/users/123?scope=scope1&scope=scope2');
    });

    it('should throw error when fetch fails', async () => {
      // Arrange
      const userId = '123';
      const scopes = ['scope1', 'scope2'];
      const fetch = jest.fn().mockRejectedValue(new Error('Failed to fetch'));
      global.fetch = fetch;

      // Act
      const act = async () => await UserClient.getUserById(userId, scopes);

      // Assert
      await expect(act).rejects.toThrow('Error: Cannot fetch user');
    });
  });
  describe('patchUserProfileById', () => {
    it('should patch user profile by id', async () => {
      // Arrange
      const userId = '123';
      const patchInfo = {
        firstName: 'John',
        lastName: 'Doe',
        bio: 'Hello',
        imageUrl: 'image.png',
        deleteImageUrl: false,
      };
      const fetch = jest.fn().mockResolvedValue({ ok: true });
      global.fetch = fetch;

      // Act
      await UserClient.patchUserProfileById(userId, patchInfo);

      // Assert
      expect(fetch).toHaveBeenCalledWith('/api/users/123', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(patchInfo),
      });
    });

    it('should throw error when patch fails', async () => {
      // Arrange
      const userId = '123';
      const patchInfo = {
        firstName: 'John',
        lastName: 'Doe',
        bio: 'Hello',
        imageUrl: 'image.png',
        deleteImageUrl: false,
      };
      const fetch = jest.fn().mockResolvedValue({ ok: false });
      global.fetch = fetch;

      // Act
      const act = async () => await UserClient.patchUserProfileById(userId, patchInfo);

      // Assert
      await expect(act).rejects.toThrow('Error: Cannot patch user profile');
    });
  });
  describe('patchUserLocationById', () => {
    it('should patch user location by id', async () => {
      // Arrange
      const userId = '123';
      const locationData = { latitude: 1, longitude: 2 };
      const fetch = jest.fn().mockResolvedValue({ ok: true });
      global.fetch = fetch;

      // Act
      await UserClient.patchUserLocationById(userId, locationData as any);

      // Assert
      expect(fetch).toHaveBeenCalledWith('/api/users/123/location', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(locationData),
      });
    });

    it('should throw error when patch fails', async () => {
      // Arrange
      const userId = '123';
      const locationData = { latitude: 1, longitude: 2 };
      const fetch = jest.fn().mockResolvedValue({ ok: false });
      global.fetch = fetch;

      // Act
      const act = async () => await UserClient.patchUserLocationById(userId, locationData as any);

      // Assert
      await expect(act).rejects.toThrow('Error: Cannot patch user location');
    });
  });
  describe('getUsersBySearchQuery', () => {
    it('should fetch users by search query', async () => {
      // Arrange
      const searchQuery = 'query';
      const response = { ok: true, json: jest.fn() };
      const fetch = jest.fn().mockResolvedValue(response);
      global.fetch = fetch;

      // Act
      await UserClient.getUsersBySearchQuery(searchQuery);

      // Assert
      expect(fetch).toHaveBeenCalledWith('/api/users/search?query=query');
    });

    it('should throw error when fetch fails', async () => {
      // Arrange
      const searchQuery = 'query';
      const fetch = jest.fn().mockResolvedValue({ ok: false });
      global.fetch = fetch;

      // Assert
      await expect(UserClient.getUsersBySearchQuery(searchQuery)).rejects.toThrow(
        'Error: Cannot fetch users',
      );
    });
  });
});
