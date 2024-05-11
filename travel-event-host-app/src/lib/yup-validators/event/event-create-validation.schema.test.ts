import { Category } from '@/lib/definitions/category';
import dayjs from 'dayjs';
import {
  eventCreateValidationSchema,
  eventCreationCategoriesSchema,
} from './event-create-validation.schema';

describe('event-create-validation.schema tests', () => {
  const validEvent = {
    title: 'title',
    description: 'description',
    startDate: new Date(),
    endDate: dayjs().add(1, 'day').toDate(),
    imageUrl: 'https://www.google.com',
  };
  describe('eventCreateValidationSchema', () => {
    test('all attributes pass validation', () => {
      expect(eventCreateValidationSchema.isValidSync(validEvent)).toBe(true);
    });
    describe('title', () => {
      test.each([
        [undefined, 'title is required'],
        ['t', 'title is too short'],
        ['t'.repeat(51), 'title is too long'],
      ])('%p should return %p', (title, expected) => {
        expect(eventCreateValidationSchema.isValidSync({ ...validEvent, title })).toBe(false);
        expect(() => eventCreateValidationSchema.validateSync({ ...validEvent, title })).toThrow(
          expected,
        );
      });
    });
    describe('description', () => {
      test.each([
        [undefined, 'description is required'],
        ['d', 'description is too short'],
        ['d'.repeat(501), 'description is too long'],
      ])('%p should return %p', (description, expected) => {
        expect(eventCreateValidationSchema.isValidSync({ ...validEvent, description })).toBe(false);
        expect(() =>
          eventCreateValidationSchema.validateSync({ ...validEvent, description }),
        ).toThrow(expected);
      });
    });
    describe('startDate', () => {
      test.each([
        [undefined, 'startDate is required'],
        [dayjs().add(-1, 'day').toDate(), 'Start date should be in the future.'],
        ['invalid date', 'End date must be valid and occur after the start date'],
      ])('%p should return %p', (startDate, expected) => {
        expect(eventCreateValidationSchema.isValidSync({ ...validEvent, startDate })).toBe(false);
        expect(() =>
          eventCreateValidationSchema.validateSync({
            ...validEvent,
            startDate,
          }),
        ).toThrow(expected);
      });
    });
    describe('endDate', () => {
      test.each([
        [undefined, 'endDate is required'],
        [dayjs().add(-1, 'day').toDate(), 'End date must be valid and occur after the start date'],
      ])('%p should return %p', (endDate, expected) => {
        expect(eventCreateValidationSchema.isValidSync({ ...validEvent, endDate })).toBe(false);
        expect(() =>
          eventCreateValidationSchema.validateSync({
            ...validEvent,
            endDate,
          }),
        ).toThrow(expected);
      });
    });
    describe('imageUrl', () => {
      test.each([
        ['invalid url', 'imageUrl must be a valid URL', false],
        [undefined, 'imageUrl must be a valid URL', true],
      ])('%p should return %p', (imageUrl, expected, res) => {
        expect(eventCreateValidationSchema.isValidSync({ ...validEvent, imageUrl })).toBe(res);
      });
    });
  });
  describe('eventCreationCategoriesSchema', () => {
    it('should validate categories', () => {
      const validCategories = [Category.Food, Category.Games, Category.HealthAndWellbeing];
      const invalidCategories = ['Music', 'Food', 'Sports', Category.Technology];

      expect(eventCreationCategoriesSchema.isValidSync({ categories: validCategories })).toBe(true);
      expect(eventCreationCategoriesSchema.isValidSync({ categories: invalidCategories })).toBe(
        false,
      );
      // Categories are optional
      expect(eventCreationCategoriesSchema.isValidSync({ categories: [] })).toBe(true);
    });
  });
});
