import { isValidMongoId } from '@/lib/utils/mongo-id-validation';
import { object, string } from 'yup';

export const userIdValidator = object({
  userId: string()
    .required('userId is required')
    .test('is-valid-object-id', 'Invalid ObjectId format', (value) => {
      return isValidMongoId(value);
    }),
});
