import { array, string } from 'yup';

export const userScopesValidator = array()
  .of(string())
  .test(
    'Received an invalid value for scopes array',
    () => 'Values in the scopes array must be one of the valid values',
    (values) => {
      if (!values) return true;

      const validValues: string[] = [
        'firstName',
        'lastName',
        'imageUrl',
        'email',
        'bio',
        'location',
        'isAdmin',
      ];
      return values.every((value) => validValues.includes(value as string));
    },
  );
