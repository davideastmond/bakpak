import { number, object, string } from 'yup';
export const timezoneValidationSchema = object({
  timezoneResult: object({
    dstOffset: number().optional(),
    rawOffset: number().optional(),
    status: string().required(),
    timeZoneId: string().required(),
    timeZoneName: string().required(),
  }),
});
