import { EventTimeLine } from '@/lib/definitions/event-timeline';
import { EventClient } from './event-client';

describe('event client tests', () => {
  describe('getEventById', () => {
    test('calls the correct endpoint', () => {
      // Arrange
      const mockFetch = jest
        .fn()
        .mockImplementation(() => Promise.resolve({ ok: true, json: () => Promise.resolve({}) }));
      global.fetch = mockFetch;
      const eventId = 'eventId';
      // Act
      EventClient.getEventById(eventId);
      // Assert
      expect(mockFetch).toHaveBeenCalledWith(`/api/events/eventId`);
    });
    test('throws error when fetch fails', async () => {
      // Arrange
      global.fetch = jest.fn().mockImplementation(() => Promise.reject());
      const eventId = 'eventId';
      // Act
      const getEventById = EventClient.getEventById(eventId);
      // Assert
      await expect(getEventById).rejects.toThrow('Error: Cannot fetch event');
    });
  });
  describe('getEventsBySearchQuery', () => {
    test('calls the search endpoint with the correct query params', () => {
      // Arrange
      const mockFetch = jest
        .fn()
        .mockImplementationOnce(() =>
          Promise.resolve({ ok: true, json: () => Promise.resolve({}) }),
        );
      global.fetch = mockFetch;
      const keyword = 'keyword';
      const categories = ['category1', 'category2'] as any[];
      const eventCreatorId = 'eventCreatorId';
      const page = 1;
      const pageSize = 10;
      const timeline = EventTimeLine.All;
      // Act
      EventClient.getEventsBySearchQuery({
        keyword,
        categories,
        eventCreatorId,
        page,
        pageSize,
        timeline,
      });
      // Assert
      expect(mockFetch).toHaveBeenCalledWith(
        `/api/events/search?category=category1&category=category2&keyword=keyword&eventCreatorId=eventCreatorId&page=1&pageSize=10&timeline=all`,
      );
    });
    test('response is not ok, should return empty array', async () => {
      // Arrange
      global.fetch = jest.fn().mockImplementationOnce(() => Promise.resolve({ ok: false }));
      // Act
      const events = await EventClient.getEventsBySearchQuery({});
      // Assert
      expect(events).toEqual([]);
    });
    test('throws error properly when fetch fails', async () => {
      // Arrange
      global.fetch = jest.fn().mockImplementationOnce(() => Promise.reject());
      // Act
      const getEventsBySearchQuery = EventClient.getEventsBySearchQuery({});
      // Assert
      await expect(getEventsBySearchQuery).rejects.toThrow("Error: Cannot fetch user's events");
    });
  });

  describe('getEventsByUserId', () => {
    test('calls the correct endpoint', async () => {
      // Arrange
      const mockFetch = jest
        .fn()
        .mockImplementationOnce(() =>
          Promise.resolve({ ok: true, json: () => Promise.resolve({}) }),
        );
      global.fetch = mockFetch;
      const userId = 'userId';
      // Act
      await EventClient.getEventsByUserId(userId);
      // Assert
      expect(mockFetch).toHaveBeenCalledWith(`/api/users/userId/events?&timeline=all&`);
    });
    test('calls the correct endpoint with page and pageSize', async () => {
      // Arrange
      const mockFetch = jest
        .fn()
        .mockImplementationOnce(() =>
          Promise.resolve({ ok: true, json: () => Promise.resolve({}) }),
        );
      global.fetch = mockFetch;
      const userId = 'userId';
      // Act
      await EventClient.getEventsByUserId(userId, EventTimeLine.Upcoming, 1, 10);
      // Assert
      expect(mockFetch).toHaveBeenCalledWith(
        `/api/users/userId/events?&timeline=upcoming&page=1&pageSize=10`,
      );
    });
    test('throws error properly when fetch fails', async () => {
      // Arrange
      global.fetch = jest.fn().mockImplementationOnce(() => Promise.resolve({ ok: false }));

      // Act
      const getEventsByUserId = EventClient.getEventsByUserId('userId');
      // Assert
      await expect(getEventsByUserId).rejects.toThrow("Error: Cannot fetch user's events");
    });
  });
  describe('getAllEvents', () => {
    test('url is formed with the correct urlParameters', async () => {
      // Arrange
      const mockFetch = jest
        .fn()
        .mockImplementationOnce(() =>
          Promise.resolve({ ok: true, json: () => Promise.resolve({}) }),
        );
      global.fetch = mockFetch;
      // Act
      await EventClient.getAllEvents(undefined);
      // Assert
      expect(mockFetch).toHaveBeenCalledWith(`/api/events?timeline=all&`);
    });
    test('url is formed with the correct page and pageSize params', async () => {
      // Arrange
      const mockFetch = jest
        .fn()
        .mockImplementationOnce(() =>
          Promise.resolve({ ok: true, json: () => Promise.resolve({}) }),
        );
      global.fetch = mockFetch;
      // Act
      await EventClient.getAllEvents(EventTimeLine.Past, 1, 10);
      // Assert
      expect(mockFetch).toHaveBeenCalledWith(`/api/events?timeline=past&page=1&pageSize=10`);
    });
    test('error is extracted and returned', async () => {
      global.fetch = jest.fn().mockImplementationOnce(() =>
        Promise.resolve({
          ok: false,
          json: () =>
            Promise.resolve({
              message: 'false error',
            }),
          status: 400,
        }),
      );
      await expect(EventClient.getAllEvents(undefined)).rejects.toThrow('false error');
    });
    test('error is thrown when fetch fails', async () => {
      global.fetch = jest
        .fn()
        .mockImplementationOnce(() =>
          Promise.resolve({ ok: false, json: () => Promise.resolve({}) }),
        );
      await expect(EventClient.getAllEvents(undefined)).rejects.toThrow(
        'Error: Cannot fetch events',
      );
    });
  });
  describe('event registration/unregistration', () => {
    test('registration - throw error properly when API request fails', async () => {
      global.fetch = jest.fn().mockImplementationOnce(() => Promise.resolve({ ok: false }));
      await expect(EventClient.registerUserForEvent('eventId', 'userId')).rejects.toThrow(
        'Error: Cannot register user for event',
      );
    });
    test('unregistration - throw error properly when API request fails', async () => {
      global.fetch = jest.fn().mockImplementationOnce(() => Promise.resolve({ ok: false }));
      await expect(EventClient.unregisterUserForEvent('eventId', 'userId')).rejects.toThrow(
        'Error: Cannot unregister user for event',
      );
    });

    test.each([['register'], ['unregister']])('%', async (action) => {
      const mockFetch = jest
        .fn()
        .mockImplementationOnce(() =>
          Promise.resolve({ ok: true, json: () => Promise.resolve({}) }),
        );
      global.fetch = mockFetch;
      if (action === 'register') {
        await EventClient.registerUserForEvent('eventId', 'userId');
      } else {
        await EventClient.unregisterUserForEvent('eventId', 'userId');
      }
      expect(mockFetch).toHaveBeenCalledWith(
        `/api/events/eventId/${action}`,
        expect.objectContaining({
          method: 'PATCH',
          body: JSON.stringify({
            userId: 'userId',
          }),
          headers: {
            'Content-Type': 'application/json',
          },
        }),
      );
    });
  });
  describe('getEventParticipants', () => {
    test('calls the correctly formatted endpoint', async () => {
      const mockFetch = jest
        .fn()
        .mockImplementationOnce(() =>
          Promise.resolve({ ok: true, json: () => Promise.resolve({}) }),
        );
      global.fetch = mockFetch;
      await EventClient.getEventParticipants('eventId');
      expect(mockFetch).toHaveBeenCalledWith(`/api/events/eventId/participants`);
    });
    test('throws error properly when fetch fails', async () => {
      global.fetch = jest.fn().mockImplementationOnce(() => Promise.resolve({ ok: false }));
      await expect(EventClient.getEventParticipants('eventId')).rejects.toThrow(
        'Error: Cannot fetch event participants',
      );
    });
  });
  describe('postCreateEvent', () => {
    test('calls the correctly formatted endpoint', async () => {
      const mockFetch = jest
        .fn()
        .mockImplementationOnce(() =>
          Promise.resolve({ ok: true, json: () => Promise.resolve({}) }),
        );
      global.fetch = mockFetch;
      await EventClient.postCreateEvent({
        title: 'title',
        description: 'description',
        location: { city: 'okc' } as any,
        startDate: '10000' as any,
        endDate: '10000' as any,
        imageUrl: 'imageUrl',
      });
      expect(mockFetch).toHaveBeenCalledWith(
        `/api/events`,
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({
            title: 'title',
            description: 'description',
            imageUrl: 'imageUrl',
            location: { city: 'okc' },
            startDate: '10000',
            endDate: '10000',
          }),
          headers: {
            'Content-Type': 'application/json',
          },
        }),
      );
    });
    test('throws error properly when fetch fails', async () => {
      global.fetch = jest.fn().mockImplementationOnce(() => Promise.resolve({ ok: false }));
      await expect(
        EventClient.postCreateEvent({
          title: 'title',
          description: 'description',
          location: { city: 'okc' } as any,
          startDate: new Date(),
          endDate: new Date(),
          imageUrl: 'imageUrl',
        }),
      ).rejects.toThrow('Error: Cannot create event');
    });
  });
  describe('patchEventById', () => {
    test('calls the correctly formatted endpoint', async () => {
      const mockFetch = jest
        .fn()
        .mockImplementationOnce(() =>
          Promise.resolve({ ok: true, json: () => Promise.resolve({}) }),
        );
      global.fetch = mockFetch;
      await EventClient.patchEventById('eventId', {
        title: 'title',
        description: 'description',
        location: { city: 'okc' } as any,
        startDate: '10000' as any,
        endDate: '10000' as any,
        imageUrl: 'imageUrl',
      });
      expect(mockFetch).toHaveBeenCalledWith(
        `/api/events/eventId`,
        expect.objectContaining({
          method: 'PATCH',
          body: JSON.stringify({
            title: 'title',
            description: 'description',
            location: { city: 'okc' },
            startDate: '10000',
            endDate: '10000',
            imageUrl: 'imageUrl',
          }),
          headers: {
            'Content-Type': 'application/json',
          },
        }),
      );
    });
    test('throws error properly when fetch fails', async () => {
      global.fetch = jest.fn().mockImplementationOnce(() => Promise.resolve({ ok: false }));
      await expect(
        EventClient.patchEventById('eventId', {
          title: 'title',
          description: 'description',
          location: { city: 'okc' } as any,
          startDate: new Date(),
          endDate: new Date(),
          imageUrl: 'imageUrl',
        }),
      ).rejects.toThrow('Error: Cannot update event');
    });
  });
});
