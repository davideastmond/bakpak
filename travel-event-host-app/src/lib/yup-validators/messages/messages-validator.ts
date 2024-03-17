import { array, object, string } from 'yup';

export const createNewMessageValidator = object({
  initiator: string().required(),
  recipients: array().of(string()).required(),
  message: string().required(),
});
