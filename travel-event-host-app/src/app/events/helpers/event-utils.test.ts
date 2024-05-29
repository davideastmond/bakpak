import { UserEvent } from '@/models/user-event';
import dayjs from 'dayjs';
import { isEventInPast } from './event-utils';

describe('EventUtils', () => {
  describe('isEventInPast', () => {
    it('should return true if event has an end date in the past', () => {
      // Arrange
      const userEvent = {
        endDate: dayjs('2021-01-01').toDate(),
      };
      // Act
      const result = isEventInPast(userEvent as UserEvent);
      // Assert
      expect(result).toBe(true);
    });
    it('should return true if event has a start date in the past', () => {
      // Arrange
      const userEvent = {
        startDate: dayjs('2021-01-01').toDate(),
      };
      // Act
      const result = isEventInPast(userEvent as UserEvent);
      // Assert
      expect(result).toBe(true);
    });
    it('should return false if event has a start date in the future', () => {
      // Arrange
      const event = {
        startDate: dayjs().add(1, 'day').toDate(),
      };
      // Act
      const result = isEventInPast(event as UserEvent);
      // Assert
      expect(result).toBe(false);
    });
  });
});
